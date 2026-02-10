namespace Education.Application.Abstractions;

public interface IRefreshTokenService
{
    Task<RefreshTokenResult> CreateAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        string? deviceId,
        CancellationToken cancellationToken = default);

    Task<RefreshTokenResult?> RotateAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        string? deviceId,
        CancellationToken cancellationToken = default);

    Task RevokeAsync(
        Guid userId,
        string? refreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default);
}

public sealed record RefreshTokenResult(
    Guid UserId,
    string Token,
    DateTimeOffset ExpiresAt);
