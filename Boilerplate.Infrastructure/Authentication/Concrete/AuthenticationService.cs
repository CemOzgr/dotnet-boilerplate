using Boilerplate.Core.Persistence;
using Boilerplate.Core.Services;
using Boilerplate.Dto;
using Boilerplate.Entities;
using Boilerplate.Infrastructure.Authentication.Abstract;
using Boilerplate.Infrastructure.Persistence.Repositories.Abstract;

namespace Boilerplate.Infrastructure.Authentication.Concrete;

public class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHashingService _passwordHashingService;
    private readonly ITokenService _tokenService;

    public AuthenticationService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHashingService passwordHashingService,
        ITokenService tokenService)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHashingService = passwordHashingService;
        _tokenService = tokenService;
    }

    public async Task<AuthenticationResponse> AuthenticateAsync(
        string email,
        string password,
        CancellationToken cancellationToken = default
    )
    {
        User? user = await _userRepository.FirstOrDefaultAsync(
            u => u.Email == email,
            cancellationToken,
            u => u.Roles);

        if (user == null || !_passwordHashingService.VerifyPassword(password, user.PasswordHash, user.PasswordSalt))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        IEnumerable<string> roles = user.Roles.Select(r => r.Name) ?? Enumerable.Empty<string>();
        string token = _tokenService.GenerateToken(
            user.Id,
            user.Email,
            user.Name,
            roles
        );

        return new AuthenticationResponse(
            user.Id,
            user.Name,
            user.Email,
            token,
            DateTime.UtcNow.AddHours(24)
        );
    }

    public async Task<AuthenticationResponse> RegisterAsync(string name, string email, string password, CancellationToken cancellationToken = default)
    {
        if (await UserExistsAsync(email, cancellationToken))
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        var passwordHash = _passwordHashingService.HashPassword(password, out var passwordSalt);

        var user = new User
        {
            Name = name,
            Email = email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            Roles = new List<Role>()
        };

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var token = _tokenService.GenerateToken(user.Id, user.Email, user.Name, Enumerable.Empty<string>());

        return new AuthenticationResponse(
            user.Id,
            user.Name,
            user.Email,
            token,
            DateTime.UtcNow.AddHours(24)
        );
    }

    public async Task<bool> ChangePasswordAsync(int userId, string currentPassword, string newPassword, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null || !_passwordHashingService.VerifyPassword(currentPassword, user.PasswordHash, user.PasswordSalt))
        {
            return false;
        }

        var newPasswordHash = _passwordHashingService.HashPassword(newPassword, out var newPasswordSalt);
        user.PasswordHash = newPasswordHash;
        user.PasswordSalt = newPasswordSalt;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> UserExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _userRepository.AnyAsync(u => u.Email == email, cancellationToken);
    }

    public async Task<UserInfoResponse?> GetUserInfoAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _userRepository.FirstOrDefaultAsync(
            u => u.Id == userId,
            cancellationToken,
            u => u.Roles);

        if (user == null)
        {
            return null;
        }

        return new UserInfoResponse(
            user.Id,
            user.Name,
            user.Email,
            user.CreatedAt,
            user.Roles.Select(r => new RoleDto(r.Id, r.Name)).ToList()
        );
    }
}