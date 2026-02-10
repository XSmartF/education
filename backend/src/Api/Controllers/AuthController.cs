using Education.Api.Contracts;
using Education.Application.Abstractions;
using System.Security.Cryptography;
using System.Text;
using Education.Infrastructure.Auth;
using Education.Infrastructure.Email;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public sealed class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;
    private readonly IJwtTokenService _tokenService;
    private readonly IRefreshTokenService _refreshTokenService;
    private readonly IEmailSender _emailSender;
    private readonly IEmailTemplateRenderer _emailTemplateRenderer;
    private readonly ILogger<AuthController> _logger;
    private readonly JwtOptions _jwtOptions;
    private readonly EmailOptions _emailOptions;

    public AuthController(
        UserManager<AppUser> userManager,
        SignInManager<AppUser> signInManager,
        IJwtTokenService tokenService,
        IRefreshTokenService refreshTokenService,
        IEmailSender emailSender,
        IEmailTemplateRenderer emailTemplateRenderer,
        ILogger<AuthController> logger,
        IOptions<JwtOptions> jwtOptions,
        IOptions<EmailOptions> emailOptions)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _refreshTokenService = refreshTokenService;
        _emailSender = emailSender;
        _emailTemplateRenderer = emailTemplateRenderer;
        _logger = logger;
        _jwtOptions = jwtOptions.Value;
        _emailOptions = emailOptions.Value;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register(RegisterRequest request)
    {
        var user = new AppUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = new Dictionary<string, string[]>
            {
                ["identity"] = result.Errors.Select(x => x.Description).ToArray()
            };

            return BadRequest(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.ValidationError,
                "Registration failed.",
                errors));
        }

        var requestedRole = ResolveRequestedRole(request.Role);
        if (!IsAllowedPublicRole(requestedRole))
        {
            return BadRequest(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.ValidationError,
                "Invalid role selection."));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, requestedRole);
        if (!roleResult.Succeeded)
        {
            var errors = new Dictionary<string, string[]>
            {
                ["role"] = roleResult.Errors.Select(x => x.Description).ToArray()
            };

            return BadRequest(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.ValidationError,
                "Role assignment failed.",
                errors));
        }

        var clientInfo = GetClientInfo();
        var refreshToken = await _refreshTokenService.CreateAsync(
            user.Id,
            clientInfo.IpAddress,
            clientInfo.UserAgent,
            clientInfo.DeviceId);

        var token = _tokenService.CreateToken(user, new[] { requestedRole });
        var accessExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.ExpMinutes);
        SetAccessTokenCookie(token, accessExpiresAt);
        SetRefreshTokenCookie(refreshToken.Token, refreshToken.ExpiresAt);
        SetCsrfCookie(GenerateCsrfToken(), refreshToken.ExpiresAt);

        await TrySendWelcomeEmailAsync(user, cancellationToken);

        return Ok(ApiResponse.Ok(new AuthResponse(token, refreshToken.Token, refreshToken.ExpiresAt)));
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login(LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Unauthorized(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.Unauthorized,
                "Invalid email or password."));
        }

        var signInResult = await _signInManager.CheckPasswordSignInAsync(
            user,
            request.Password,
            lockoutOnFailure: true);

        if (signInResult.IsLockedOut)
        {
            return StatusCode(StatusCodes.Status423Locked,
                ApiResponse.Fail<AuthResponse>(ApiErrorCodes.LockedOut, "Account locked. Try again later."));
        }

        if (!signInResult.Succeeded)
        {
            return Unauthorized(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.Unauthorized,
                "Invalid email or password."));
        }

        var requestedRole = string.IsNullOrWhiteSpace(request.Role)
            ? null
            : ResolveRequestedRole(request.Role);

        if (requestedRole is not null && !IsKnownRole(requestedRole))
        {
            return BadRequest(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.ValidationError,
                "Invalid role selection."));
        }

        var roles = await _userManager.GetRolesAsync(user);
        if (roles.Count == 0 && (requestedRole is null || requestedRole == RoleNames.Student))
        {
            var addRole = await _userManager.AddToRoleAsync(user, RoleNames.Student);
            if (addRole.Succeeded)
            {
                roles = await _userManager.GetRolesAsync(user);
            }
        }

        if (requestedRole is not null && !roles.Contains(requestedRole) && !roles.Contains(RoleNames.Admin))
        {
            return StatusCode(StatusCodes.Status403Forbidden,
                ApiResponse.Fail<AuthResponse>(ApiErrorCodes.Forbidden, "Access denied for role."));
        }

        var clientInfo = GetClientInfo();
        var refreshToken = await _refreshTokenService.CreateAsync(
            user.Id,
            clientInfo.IpAddress,
            clientInfo.UserAgent,
            clientInfo.DeviceId);

        var token = _tokenService.CreateToken(user, roles);
        var accessExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.ExpMinutes);
        SetAccessTokenCookie(token, accessExpiresAt);
        SetRefreshTokenCookie(refreshToken.Token, refreshToken.ExpiresAt);
        SetCsrfCookie(GenerateCsrfToken(), refreshToken.ExpiresAt);

        return Ok(ApiResponse.Ok(new AuthResponse(token, refreshToken.Token, refreshToken.ExpiresAt)));
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Refresh([FromBody] RefreshRequest? request, CancellationToken cancellationToken)
    {
        var token = request?.RefreshToken ?? Request.Cookies[RefreshTokenCookieName];
        if (string.IsNullOrWhiteSpace(token))
        {
            return Unauthorized(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.Unauthorized,
                "Refresh token missing."));
        }

        var clientInfo = GetClientInfo();
        var rotated = await _refreshTokenService.RotateAsync(
            token,
            clientInfo.IpAddress,
            clientInfo.UserAgent,
            clientInfo.DeviceId,
            cancellationToken);

        if (rotated is null)
        {
            ClearAccessTokenCookie();
            ClearRefreshTokenCookie();
            ClearCsrfCookie();
            return Unauthorized(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.Unauthorized,
                "Refresh token invalid."));
        }

        var user = await _userManager.FindByIdAsync(rotated.UserId.ToString());
        if (user is null)
        {
            ClearAccessTokenCookie();
            ClearRefreshTokenCookie();
            ClearCsrfCookie();
            return Unauthorized(ApiResponse.Fail<AuthResponse>(
                ApiErrorCodes.Unauthorized,
                "User not found."));
        }

        var roles = await _userManager.GetRolesAsync(user);
        var accessToken = _tokenService.CreateToken(user, roles);
        var accessExpiresAt = DateTimeOffset.UtcNow.AddMinutes(_jwtOptions.ExpMinutes);
        SetAccessTokenCookie(accessToken, accessExpiresAt);
        SetRefreshTokenCookie(rotated.Token, rotated.ExpiresAt);
        SetCsrfCookie(GenerateCsrfToken(), rotated.ExpiresAt);

        return Ok(ApiResponse.Ok(new AuthResponse(accessToken, rotated.Token, rotated.ExpiresAt)));
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse<object?>>> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(ApiResponse.Fail(ApiErrorCodes.ValidationError, "Email is required."));
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null)
        {
            return Ok(ApiResponse.Ok());
        }

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
        var resetUrl = BuildResetPasswordUrl(request.Client, user.Id.ToString(), encodedToken);

        if (string.IsNullOrWhiteSpace(resetUrl))
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                ApiResponse.Fail(ApiErrorCodes.ServerError, "Reset password URL not configured."));
        }

        var tokens = new Dictionary<string, string>
        {
            ["AppName"] = _emailOptions.AppName,
            ["DisplayName"] = string.IsNullOrWhiteSpace(user.DisplayName) ? user.Email ?? "User" : user.DisplayName,
            ["ResetUrl"] = resetUrl,
            ["SupportEmail"] = string.IsNullOrWhiteSpace(_emailOptions.SupportEmail) ? _emailOptions.FromEmail : _emailOptions.SupportEmail,
            ["ExpiresMinutes"] = _emailOptions.ResetTokenMinutes.ToString()
        };

        var htmlBody = await _emailTemplateRenderer.RenderAsync(
            _emailOptions.ResetPasswordTemplateFile,
            tokens,
            cancellationToken);

        var message = new EmailMessage(
            user.Email ?? request.Email,
            _emailOptions.ResetPasswordSubject,
            htmlBody);

        await _emailSender.SendAsync(message, cancellationToken);

        return Ok(ApiResponse.Ok());
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<ActionResult<ApiResponse<object?>>> ResetPassword(
        [FromBody] ResetPasswordRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.UserId) ||
            string.IsNullOrWhiteSpace(request.Token) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(ApiResponse.Fail(ApiErrorCodes.ValidationError, "Missing reset password data."));
        }

        var user = await _userManager.FindByIdAsync(request.UserId);
        if (user is null)
        {
            return BadRequest(ApiResponse.Fail(ApiErrorCodes.BadRequest, "Invalid reset request."));
        }

        string token;
        try
        {
            token = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
        }
        catch (FormatException)
        {
            return BadRequest(ApiResponse.Fail(ApiErrorCodes.BadRequest, "Invalid reset token."));
        }

        var result = await _userManager.ResetPasswordAsync(user, token, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = new Dictionary<string, string[]>
            {
                ["password"] = result.Errors.Select(x => x.Description).ToArray()
            };

            return BadRequest(ApiResponse.Fail(ApiErrorCodes.ValidationError, "Reset password failed.", errors));
        }

        return Ok(ApiResponse.Ok());
    }

    [Authorize]
    [HttpPost("revoke")]
    public async Task<ActionResult<ApiResponse<object?>>> Revoke([FromBody] RevokeRequest? request, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(_userManager.GetUserId(User)!);
        var token = request?.RefreshToken ?? Request.Cookies[RefreshTokenCookieName];
        var clientInfo = GetClientInfo();

        await _refreshTokenService.RevokeAsync(userId, token, clientInfo.IpAddress, cancellationToken);
        ClearAccessTokenCookie();
        ClearRefreshTokenCookie();
        ClearCsrfCookie();

        return Ok(ApiResponse.Ok());
    }

    private string BuildResetPasswordUrl(string? client, string userId, string token)
    {
        var baseUrl = string.Equals(client, "mobile", StringComparison.OrdinalIgnoreCase) &&
                      !string.IsNullOrWhiteSpace(_emailOptions.MobileResetPasswordUrl)
            ? _emailOptions.MobileResetPasswordUrl
            : _emailOptions.ResetPasswordUrl;

        if (string.IsNullOrWhiteSpace(baseUrl))
        {
            baseUrl = $"{Request.Scheme}://{Request.Host}/reset-password";
        }

        var separator = baseUrl.Contains('?', StringComparison.Ordinal) ? "&" : "?";
        return $"{baseUrl}{separator}userId={Uri.EscapeDataString(userId)}&token={Uri.EscapeDataString(token)}";
    }

    private ClientInfo GetClientInfo()
    {
        return new ClientInfo(
            HttpContext.Connection.RemoteIpAddress?.ToString(),
            Request.Headers.UserAgent.ToString(),
            Request.Headers.TryGetValue(AuthCookieNames.DeviceIdHeader, out var deviceId) ? deviceId.ToString() : null);
    }

    private void SetAccessTokenCookie(string token, DateTimeOffset expiresAt)
    {
        var isHttps = Request.IsHttps;
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = isHttps,
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = expiresAt.UtcDateTime,
            Path = "/"
        };

        Response.Cookies.Append(AuthCookieNames.AccessToken, token, options);
    }

    private void SetRefreshTokenCookie(string token, DateTimeOffset expiresAt)
    {
        var isHttps = Request.IsHttps;
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = isHttps,
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = expiresAt.UtcDateTime,
            Path = "/api/auth/refresh"
        };

        Response.Cookies.Append(AuthCookieNames.RefreshToken, token, options);
    }

    private void SetCsrfCookie(string token, DateTimeOffset expiresAt)
    {
        var isHttps = Request.IsHttps;
        var options = new CookieOptions
        {
            HttpOnly = false,
            Secure = isHttps,
            SameSite = isHttps ? SameSiteMode.None : SameSiteMode.Lax,
            Expires = expiresAt.UtcDateTime,
            Path = "/"
        };

        Response.Cookies.Append(AuthCookieNames.CsrfToken, token, options);
    }

    private static string GenerateCsrfToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(32);
        return Convert.ToHexString(bytes);
    }

    private void ClearAccessTokenCookie()
    {
        Response.Cookies.Delete(AuthCookieNames.AccessToken, new CookieOptions
        {
            Path = "/"
        });
    }

    private void ClearRefreshTokenCookie()
    {
        Response.Cookies.Delete(AuthCookieNames.RefreshToken, new CookieOptions
        {
            Path = "/api/auth/refresh"
        });
    }

    private void ClearCsrfCookie()
    {
        Response.Cookies.Delete(AuthCookieNames.CsrfToken, new CookieOptions
        {
            Path = "/"
        });
    }

    private sealed record ClientInfo(string? IpAddress, string? UserAgent, string? DeviceId);

    private static string ResolveRequestedRole(string? role)
    {
        if (!string.IsNullOrWhiteSpace(role))
        {
            return NormalizeRole(role);
        }

        return RoleNames.Student;
    }

    private static string NormalizeRole(string role)
    {
        if (role.Equals(RoleNames.Admin, StringComparison.OrdinalIgnoreCase))
        {
            return RoleNames.Admin;
        }

        if (role.Equals(RoleNames.Student, StringComparison.OrdinalIgnoreCase))
        {
            return RoleNames.Student;
        }

        if (role.Equals(RoleNames.Teacher, StringComparison.OrdinalIgnoreCase))
        {
            return RoleNames.Teacher;
        }

        if (role.Equals(RoleNames.Organize, StringComparison.OrdinalIgnoreCase))
        {
            return RoleNames.Organize;
        }

        return role;
    }

    private static bool IsKnownRole(string role)
    {
        return role == RoleNames.Admin
            || role == RoleNames.Student
            || role == RoleNames.Teacher
            || role == RoleNames.Organize;
    }

    private static bool IsAllowedPublicRole(string role)
    {
        return role == RoleNames.Student
            || role == RoleNames.Teacher
            || role == RoleNames.Organize;
    }

    private async Task TrySendWelcomeEmailAsync(AppUser user, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(user.Email))
        {
            return;
        }

        var loginUrl = string.IsNullOrWhiteSpace(_emailOptions.LoginUrl)
            ? $"{Request.Scheme}://{Request.Host}/login"
            : _emailOptions.LoginUrl;

        var tokens = new Dictionary<string, string>
        {
            ["AppName"] = _emailOptions.AppName,
            ["DisplayName"] = string.IsNullOrWhiteSpace(user.DisplayName) ? user.Email ?? "User" : user.DisplayName,
            ["LoginUrl"] = loginUrl,
            ["SupportEmail"] = string.IsNullOrWhiteSpace(_emailOptions.SupportEmail) ? _emailOptions.FromEmail : _emailOptions.SupportEmail,
        };

        try
        {
            var htmlBody = await _emailTemplateRenderer.RenderAsync(
                _emailOptions.WelcomeTemplateFile,
                tokens,
                cancellationToken);

            if (string.IsNullOrWhiteSpace(htmlBody))
            {
                return;
            }

            var message = new EmailMessage(
                user.Email,
                _emailOptions.WelcomeSubject,
                htmlBody);

            await _emailSender.SendAsync(message, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send welcome email.");
        }
    }

    public sealed record RegisterRequest(string Email, string Password, string DisplayName, string? Role, string? Client);
    public sealed record LoginRequest(string Email, string Password, string? Role, string? Client);
    public sealed record ForgotPasswordRequest(string Email, string? Client);
    public sealed record ResetPasswordRequest(string UserId, string Token, string NewPassword);
    public sealed record RefreshRequest(string? RefreshToken);
    public sealed record RevokeRequest(string? RefreshToken);
    public sealed record AuthResponse(string AccessToken, string RefreshToken, DateTimeOffset RefreshTokenExpiresAt);
}
