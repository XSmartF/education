namespace Education.Infrastructure.Identity;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Education.Application.Abstractions;
using Microsoft.AspNetCore.Http;

public sealed class CurrentUser : ICurrentUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public bool IsAuthenticated => _httpContextAccessor.HttpContext?.User?.Identity?.IsAuthenticated ?? false;

    public string? UserId =>
        GetClaimValue(ClaimTypes.NameIdentifier) ?? GetClaimValue(JwtRegisteredClaimNames.Sub);

    public string? Email =>
        GetClaimValue(ClaimTypes.Email) ?? GetClaimValue(JwtRegisteredClaimNames.Email);

    private string? GetClaimValue(string type)
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(type)?.Value;
    }
}
