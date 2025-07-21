using Boilerplate.Dto;

namespace Boilerplate.Infrastructure.Authentication.Abstract;

public interface IAuthenticationService
{
    Task<AuthenticationResponse> AuthenticateAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthenticationResponse> RegisterAsync(string name, string email, string password, CancellationToken cancellationToken = default);
    Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);
    Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<UserInfoResponse?> GetUserInfoAsync(int userId, CancellationToken cancellationToken = default);
}