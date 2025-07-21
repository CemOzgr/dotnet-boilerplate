using Boilerplate.Infrastructure.Persistence.Seeding;

namespace Boilerplate.WebApi.Extensions;

public static class DatabaseExtensions
{
    public static async Task<WebApplication> SeedDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var seeder = scope.ServiceProvider.GetRequiredService<IDataSeeder>();
        await seeder.SeedAsync();
        return app;
    }
}
