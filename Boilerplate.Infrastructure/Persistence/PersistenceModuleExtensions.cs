using Boilerplate.Core.Persistence;
using Boilerplate.Core.Persistence.EfCore;
using Boilerplate.Infrastructure.Persistence.Repositories.Abstract;
using Boilerplate.Infrastructure.Persistence.Repositories.Concrete;
using Boilerplate.Infrastructure.Persistence.Seeding;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.Persistence;

public static class PersistenceModuleExtensions
{
    public static IServiceCollection AddPersistenceModule(
        this IServiceCollection services,
        ConfigurationManager configuration
    )
    {
        services.AddDbContext<BoilerplateContext>(optionsBuilder =>
                optionsBuilder
                    .UseInMemoryDatabase("za")
        );

        services
            .AddScoped<IUserRepository, EfUserRepository>()
            .AddScoped<IRoleRepository, EfRoleRepository>()
            .AddScoped<IUnitOfWork, EfUnitOfWork<BoilerplateContext>>()
            .AddScoped<IDataSeeder, DataSeeder>();

        return services;
    }
}