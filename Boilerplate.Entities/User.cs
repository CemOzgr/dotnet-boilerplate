using Boilerplate.Core.Entities;

namespace Boilerplate.Entities;

public class User : IEntity
{
    public int Id { get; set; }

    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string PasswordSalt { get; set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public List<Role> Roles { get; set; }
}