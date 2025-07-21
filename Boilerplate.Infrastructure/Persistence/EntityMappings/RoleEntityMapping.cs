using Boilerplate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Boilerplate.Infrastructure.Persistence.EntityMappings;

public class RoleEntityMapping : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder
            .ToTable("Roles")
            .HasKey(r => r.Id);

        builder
            .Property(r => r.Name)
            .IsRequired();
    }
}