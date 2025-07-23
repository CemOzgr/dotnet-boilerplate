using Boilerplate.Core.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.Authentication;

public static class AuthenticationModuleExtensions
{
    public static IServiceCollection AddAuthenticationModule(this IServiceCollection services)
    {
        services
            .AddScoped<ITokenService, TokenService>()
            .AddScoped<IPasswordHashingService, PasswordHashingService>();

        return services;
    }
}