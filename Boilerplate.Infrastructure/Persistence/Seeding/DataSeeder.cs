using Boilerplate.Core.Services;
using Boilerplate.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Boilerplate.Infrastructure.Persistence.Seeding;

public class DataSeeder : IDataSeeder
{
    private readonly BoilerplateContext _context;
    private readonly IPasswordHashingService _passwordHashingService;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        BoilerplateContext context, 
        IPasswordHashingService passwordHashingService,
        ILogger<DataSeeder> logger)
    {
        _context = context;
        _passwordHashingService = passwordHashingService;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        try
        {
            // Ensure database is created
            await _context.Database.EnsureCreatedAsync();

            // Seed roles first
            await SeedRolesAsync();
            
            // Then seed users
            await SeedUsersAsync();

            _logger.LogInformation("Database seeding completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        if (await _context.Roles.AnyAsync())
        {
            _logger.LogInformation("Roles already exist, skipping role seeding");
            return;
        }

        var roles = new[]
        {
            new Role { Name = "Admin" },
            new Role { Name = "User" },
            new Role { Name = "Manager" }
        };

        _context.Roles.AddRange(roles);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Seeded {Count} roles", roles.Length);
    }

    private async Task SeedUsersAsync()
    {
        if (await _context.Users.AnyAsync())
        {
            _logger.LogInformation("Users already exist, skipping user seeding");
            return;
        }

        // Get roles from database
        var adminRole = await _context.Roles.FirstAsync(r => r.Name == "Admin");
        var userRole = await _context.Roles.FirstAsync(r => r.Name == "User");
        var managerRole = await _context.Roles.FirstAsync(r => r.Name == "Manager");

        // Create admin user
        var adminPasswordHash = _passwordHashingService.HashPassword("Admin123!", out var adminSalt);
        var adminUser = new User
        {
            Name = "System Administrator",
            Email = "admin@boilerplate.com",
            PasswordHash = adminPasswordHash,
            PasswordSalt = adminSalt,
            Roles = new List<Role> { adminRole }
        };

        // Create manager user
        var managerPasswordHash = _passwordHashingService.HashPassword("Manager123!", out var managerSalt);
        var managerUser = new User
        {
            Name = "Project Manager",
            Email = "manager@boilerplate.com",
            PasswordHash = managerPasswordHash,
            PasswordSalt = managerSalt,
            Roles = new List<Role> { managerRole, userRole }
        };

        // Create regular user
        var userPasswordHash = _passwordHashingService.HashPassword("User123!", out var userSalt);
        var regularUser = new User
        {
            Name = "John Doe",
            Email = "user@boilerplate.com",
            PasswordHash = userPasswordHash,
            PasswordSalt = userSalt,
            Roles = new List<Role> { userRole }
        };

        // Create test user for easy testing
        var testPasswordHash = _passwordHashingService.HashPassword("test", out var testSalt);
        var testUser = new User
        {
            Name = "Test User",
            Email = "test@test.com",
            PasswordHash = testPasswordHash,
            PasswordSalt = testSalt,
            Roles = new List<Role> { userRole }
        };

        var users = new[] { adminUser, managerUser, regularUser, testUser };
        
        _context.Users.AddRange(users);
        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Seeded {Count} users with default credentials: Admin(admin@boilerplate.com/Admin123!), Manager(manager@boilerplate.com/Manager123!), User(user@boilerplate.com/User123!), Test(test@test.com/test)", users.Length);
    }
}
