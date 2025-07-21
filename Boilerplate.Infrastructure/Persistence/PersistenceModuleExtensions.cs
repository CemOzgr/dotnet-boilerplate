using Boilerplate.Core.Persistence;
using Boilerplate.Core.Persistence.EfCore;
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
                    .UseSqlServer(configuration.GetConnectionString("Db"))
        );

        services
            .AddScoped<IUnitOfWork, EfUnitOfWork<BoilerplateContext>>();

        return services;
    }
}