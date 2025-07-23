using Boilerplate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Boilerplate.Infrastructure.Persistence.EntityMappings;

public class ConfirmationTokenEntityMapping : IEntityTypeConfiguration<ConfirmationToken>
{
    public void Configure(EntityTypeBuilder<ConfirmationToken> builder)
    {
        builder
            .ToTable("ConfirmationTokens")
            .HasKey(t => t.Id);

        builder
            .Property(t => t.Token)
            .IsRequired();

        builder
            .Property(t => t.CreatedAt)
            .IsRequired();

        builder
            .Property(t => t.ConfirmedAt)
            .IsRequired(false);

        builder
            .Property(t => t.ExpiresAt)
            .IsRequired();
    }
}