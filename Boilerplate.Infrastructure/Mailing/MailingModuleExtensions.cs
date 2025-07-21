using Boilerplate.Core.Mailing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.Mailing;

public static class MailingModuleExtensions
{
    public static IServiceCollection AddMailingModule(
        this IServiceCollection services,
        IConfigurationManager configuration
    )
    {
        services.AddSingleton<IMailSender, MailKitMailSender>();
        services.Configure<EmailOptions>(configuration.GetSection("Mail"));

        return services;
    }
}