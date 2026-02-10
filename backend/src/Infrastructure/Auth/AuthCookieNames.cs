namespace Education.Infrastructure.Auth;

public static class AuthCookieNames
{
    public const string AccessToken = "at";
    public const string RefreshToken = "rt";
    public const string CsrfToken = "XSRF-TOKEN";
    public const string CsrfHeader = "X-CSRF-Token";
    public const string DeviceIdHeader = "X-Device-Id";
}
