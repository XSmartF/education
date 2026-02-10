namespace Education.Infrastructure.Auth;

public sealed class RefreshTokenOptions
{
    public int ExpDays { get; init; } = 30;
    public int TokenSize { get; init; } = 64;
}
