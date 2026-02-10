namespace Education.Infrastructure.Auth;

using Education.Infrastructure.Identity;

public interface IJwtTokenService
{
    string CreateToken(AppUser user, IEnumerable<string> roles);
}
