using Boilerplate.Business.Abstract;
using Boilerplate.Core.Mailing;
using Boilerplate.Core.Persistence;
using Boilerplate.Core.Services;
using Boilerplate.Dto;
using Boilerplate.Entities;
using Boilerplate.Entities.Exceptions;
using Boilerplate.Infrastructure.Persistence.Repositories.Abstract;

namespace Boilerplate.Business.Concrete;

public class IdentityService : IIdentityService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHashingService _passwordHashingService;
    private readonly ITokenService _tokenService;
    private readonly IMailSender _mailSender;
    private readonly IRoleRepository _roleRepository;

    public IdentityService(
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        IPasswordHashingService passwordHashingService,
        ITokenService tokenService,
        IMailSender mailSender,
        IRoleRepository roleRepository
    )
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _passwordHashingService = passwordHashingService;
        _tokenService = tokenService;
        _mailSender = mailSender;
        _roleRepository = roleRepository;
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
            u => u.Roles
        );

        if (user == null || !_passwordHashingService.VerifyPassword(
                password,
                user.PasswordHash,
                user.PasswordSalt
            ))
        {
            throw new UnauthorizedAccessException("Invalid email or password");
        }

        if (user.ActivatedAt == null || user.DeactivatedAt != null)
        {
            throw new UnauthorizedAccessException("User account is not active");
        }

        IEnumerable<string> roles = user.Roles.Select(r => r.Name);
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

    public async Task RegisterAsync(
        string name,
        string email,
        string password,
        CancellationToken cancellationToken = default
    )
    {
        if (await UserExistsAsync(email, cancellationToken))
        {
            throw new InvalidOperationException("User with this email already exists");
        }

        string passwordHash = _passwordHashingService.HashPassword(
            password,
            out string passwordSalt
        );

        Role? userRole = await _roleRepository.FirstOrDefaultAsync(
            r => r.Name == "User",
            cancellationToken
        );

        if (userRole == null) throw new InvalidOperationException("User role not found");

        User user = new()
        {
            Name = name,
            Email = email,
            PasswordHash = passwordHash,
            PasswordSalt = passwordSalt,
            Roles = [userRole]
        };

        user.AssignConfirmationToken(Guid.NewGuid().ToString());

        await _userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        await _mailSender.SendAsync(
            new MailData(
                $"Welcome {name}!",
                user.ConfirmationTokens[^1].Token,
                [email]
            ),
            cancellationToken
        );
    }

    public async Task ConfirmEmailAsync(
        string token,
        CancellationToken cancellationToken = default
    )
    {
        User? user = await _userRepository
            .GetAsync(
                new Specification<User>(
                    u => u.ConfirmationTokens.Any(t => t.Token == token),
                    [u => u.ConfirmationTokens]
                ),
                cancellationToken
            );

        if (user == null) throw new EntityNotFoundException(nameof(User));

        user.Activate();
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task ChangePasswordAsync(
        int userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default
    )
    {
        User? user = await _userRepository.FirstOrDefaultAsync(
            u => u.Id == userId,
            cancellationToken
        );

        if (user == null) throw new EntityNotFoundException(nameof(User));

        string newPasswordHash = _passwordHashingService.HashPassword(
            newPassword,
            out string newPasswordSalt
        );

        user.PasswordHash = newPasswordHash;
        user.PasswordSalt = newPasswordSalt;

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public Task<bool> UserExistsAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        return _userRepository.AnyAsync(
            u => u.Email == email,
            cancellationToken
        );
    }

    public async Task<UserInfoResponse> GetUserInfoAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        User? user = await _userRepository.FirstOrDefaultAsync(
            u => u.Id == userId,
            cancellationToken,
            u => u.Roles
        );

        if (user == null) throw new EntityNotFoundException(nameof(User));

        return new UserInfoResponse(
            user.Id,
            user.Name,
            user.Email,
            user.CreatedAt,
            user.Roles
                .Select(r => new RoleDto(r.Id, r.Name))
                .ToList()
        );
    }
}