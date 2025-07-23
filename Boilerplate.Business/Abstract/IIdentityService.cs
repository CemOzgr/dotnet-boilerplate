using Boilerplate.Dto;

namespace Boilerplate.Business.Abstract;

public interface IIdentityService
{
    Task<AuthenticationResponse> AuthenticateAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default
    );

    Task RegisterAsync(
        string name,
        string email,
        string password,
        CancellationToken cancellationToken = default
    );

    Task ChangePasswordAsync(int userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default);
    Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<UserInfoResponse> GetUserInfoAsync(int userId, CancellationToken cancellationToken = default);

    Task ConfirmEmailAsync(
        string token,
        CancellationToken cancellationToken = default
    );
}