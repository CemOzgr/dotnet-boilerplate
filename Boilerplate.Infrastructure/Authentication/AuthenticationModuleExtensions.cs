using Boilerplate.Business.Abstract;
using Boilerplate.Business.Concrete;
using Boilerplate.Core.Persistence;
using Boilerplate.Core.Services;
using Boilerplate.Entities;
using Boilerplate.Infrastructure.Authentication;
using Boilerplate.Infrastructure.Persistence.Repositories;
using Boilerplate.Infrastructure.Persistence.Repositories.Concrete;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.Authentication;

public static class AuthenticationModuleExtensions
{
    public static IServiceCollection AddAuthenticationModule(this IServiceCollection services)
    {
        services
            .AddScoped<ITokenService, TokenService>()
            .AddScoped<IAuthenticationService, AuthenticationService>()
            .AddScoped<IPasswordHashingService, PasswordHashingService>();

        return services;
    }
}