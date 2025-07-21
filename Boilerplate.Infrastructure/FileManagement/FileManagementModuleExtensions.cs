using Boilerplate.Core.FileManagement;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.FileManagement;

public static class FileManagementModuleExtensions
{
    public static IServiceCollection AddFileManagementModule(
        this IServiceCollection services
    )
    {
        return services.AddSingleton<IFileStore, FileSystemFileStore>();
    }
}