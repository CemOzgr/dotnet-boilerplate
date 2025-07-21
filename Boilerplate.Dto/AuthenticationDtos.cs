using System.ComponentModel.DataAnnotations;

namespace Boilerplate.Dto;

public record LoginRequest(
    [Required, EmailAddress] string Email,
    [Required] string Password
);

public record RegisterRequest(
    [Required] string Name,
    [Required, EmailAddress] string Email,
    [Required, MinLength(6)] string Password
);

public record AuthenticationResponse(
    int UserId,
    string Name,
    string Email,
    string Token,
    DateTime ExpiresAt
);

public record ChangePasswordRequest(
    [Required] string CurrentPassword,
    [Required, MinLength(6)] string NewPassword
);

public record UserInfoResponse(
    int Id,
    string Name,
    string Email,
    DateTimeOffset CreatedAt,
    List<RoleDto> Roles
);

public record RoleDto(
    int Id,
    string Name
);