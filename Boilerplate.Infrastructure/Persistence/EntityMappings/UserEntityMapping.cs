using Boilerplate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Boilerplate.Infrastructure.Persistence.EntityMappings;

// public class User : IEntity
// {
//     public int Id { get; set; }
//
//     public string Name { get; set; }
//     public string Email { get; set; }
//     public string PasswordHash { get; set; }
//     public string PasswordSalt { get; set; }
//
//     public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;
//
//     public List<Role> Roles { get; set; }
// }

public class UserEntityMapping : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder
            .ToTable("Users")
            .HasKey(u => u.Id);

        builder
            .Property(u => u.Name)
            .IsRequired();

        builder
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(256);

        builder
            .Property(u => u.PasswordHash)
            .IsRequired();

        builder
            .Property(u => u.PasswordSalt)
            .IsRequired();

        builder
            .Property(u => u.CreatedAt)
            .IsRequired();

        builder
            .HasMany(u => u.Roles)
            .WithMany()
            .UsingEntity<UserRole>(
                nameof(UserRole),
                j => j
                    .HasOne(ur => ur.Role)
                    .WithMany()
                    .HasForeignKey(ur => ur.RoleId),
                j => j
                    .HasOne(ur => ur.User)
                    .WithMany()
                    .HasForeignKey(ur => ur.UserId),
                j => j
                    .HasKey(ur => new { ur.UserId, ur.RoleId })
            );
    }
}