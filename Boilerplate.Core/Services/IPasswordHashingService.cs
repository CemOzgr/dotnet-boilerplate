namespace Boilerplate.Core.Services;

public interface IPasswordHashingService
{
    string HashPassword(string password, out string salt);
    bool VerifyPassword(string password, string hash, string salt);
}

public interface ITokenService
{
    string GenerateToken(int userId, string email, string name, IEnumerable<string> roles);
}
