namespace Education.Infrastructure.Auth;

using System.Security.Cryptography;
using System.Text;
using Education.Application.Abstractions;
using Education.Infrastructure.Data;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

public sealed class RefreshTokenService : IRefreshTokenService
{
    private readonly AppDbContext _db;
    private readonly RefreshTokenOptions _options;

    public RefreshTokenService(AppDbContext db, IOptions<RefreshTokenOptions> options)
    {
        _db = db;
        _options = options.Value;
    }

    public async Task<RefreshTokenResult> CreateAsync(
        Guid userId,
        string? ipAddress,
        string? userAgent,
        string? deviceId,
        CancellationToken cancellationToken = default)
    {
        var token = GenerateToken();
        var entity = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TokenHash = HashToken(token),
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_options.ExpDays),
            CreatedByIp = ipAddress,
            CreatedByUserAgent = userAgent,
            DeviceId = deviceId
        };

        _db.RefreshTokens.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResult(entity.UserId, token, entity.ExpiresAt);
    }

    public async Task<RefreshTokenResult?> RotateAsync(
        string refreshToken,
        string? ipAddress,
        string? userAgent,
        string? deviceId,
        CancellationToken cancellationToken = default)
    {
        var hash = HashToken(refreshToken);
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(x => x.TokenHash == hash, cancellationToken);

        if (token is null)
        {
            return null;
        }

        if (!token.IsActive)
        {
            if (token.RevokedAt is not null && token.ReplacedByTokenHash is not null)
            {
                await RevokeAllAsync(token.UserId, ipAddress, cancellationToken);
            }

            return null;
        }

        var newToken = GenerateToken();
        var newHash = HashToken(newToken);

        token.RevokedAt = DateTimeOffset.UtcNow;
        token.RevokedByIp = ipAddress;
        token.ReplacedByTokenHash = newHash;

        var rotated = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = token.UserId,
            TokenHash = newHash,
            ExpiresAt = DateTimeOffset.UtcNow.AddDays(_options.ExpDays),
            CreatedByIp = ipAddress,
            CreatedByUserAgent = userAgent,
            DeviceId = deviceId
        };

        _db.RefreshTokens.Add(rotated);
        await _db.SaveChangesAsync(cancellationToken);

        return new RefreshTokenResult(rotated.UserId, newToken, rotated.ExpiresAt);
    }

    public async Task RevokeAsync(
        Guid userId,
        string? refreshToken,
        string? ipAddress,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(refreshToken))
        {
            await RevokeAllAsync(userId, ipAddress, cancellationToken);
            return;
        }

        var hash = HashToken(refreshToken);
        var token = await _db.RefreshTokens
            .FirstOrDefaultAsync(x => x.UserId == userId && x.TokenHash == hash, cancellationToken);

        if (token is null || token.RevokedAt is not null)
        {
            return;
        }

        token.RevokedAt = DateTimeOffset.UtcNow;
        token.RevokedByIp = ipAddress;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task RevokeAllAsync(Guid userId, string? ipAddress, CancellationToken cancellationToken)
    {
        var tokens = await _db.RefreshTokens
            .Where(x => x.UserId == userId && x.RevokedAt == null)
            .ToListAsync(cancellationToken);

        if (tokens.Count == 0)
        {
            return;
        }

        foreach (var token in tokens)
        {
            token.RevokedAt = DateTimeOffset.UtcNow;
            token.RevokedByIp = ipAddress;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    private string GenerateToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(_options.TokenSize);
        return WebEncoders.Base64UrlEncode(bytes);
    }

    private static string HashToken(string token)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(token));
        return Convert.ToHexString(bytes);
    }
}
