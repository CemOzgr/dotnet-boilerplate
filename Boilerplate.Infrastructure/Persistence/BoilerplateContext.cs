using Boilerplate.Entities;
using Boilerplate.Infrastructure.Persistence.EntityMappings;
using Microsoft.EntityFrameworkCore;

namespace Boilerplate.Infrastructure.Persistence;

public class BoilerplateContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<UserRole> UserRoles => Set<UserRole>(nameof(UserRole));

    public BoilerplateContext(DbContextOptions<BoilerplateContext> options)
        : base(options)
    { }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserEntityMapping).Assembly);
    }
}