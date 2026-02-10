using Education.Api.Contracts;
using Education.Infrastructure.Auth;

namespace Education.Api.Middleware;

public sealed class CsrfProtectionMiddleware
{
    private static readonly HashSet<string> SafeMethods = new(StringComparer.OrdinalIgnoreCase)
    {
        HttpMethods.Get,
        HttpMethods.Head,
        HttpMethods.Options,
        HttpMethods.Trace
    };

    private static readonly HashSet<string> ExcludedPaths = new(StringComparer.OrdinalIgnoreCase)
    {
        "/api/auth/login",
        "/api/auth/register"
    };

    private readonly RequestDelegate _next;

    public CsrfProtectionMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        if (SafeMethods.Contains(context.Request.Method) ||
            ExcludedPaths.Contains(context.Request.Path.Value ?? string.Empty))
        {
            await _next(context);
            return;
        }

        if (context.Request.Headers.ContainsKey("Authorization"))
        {
            await _next(context);
            return;
        }

        if (!context.Request.Cookies.TryGetValue(AuthCookieNames.AccessToken, out _))
        {
            await _next(context);
            return;
        }

        var csrfCookie = context.Request.Cookies[AuthCookieNames.CsrfToken];
        var csrfHeader = context.Request.Headers[AuthCookieNames.CsrfHeader].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(csrfCookie) || !string.Equals(csrfCookie, csrfHeader, StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            await context.Response.WriteAsJsonAsync(
                ApiResponse.Fail(ApiErrorCodes.Forbidden, "CSRF validation failed."),
                context.RequestAborted);
            return;
        }

        await _next(context);
    }
}
