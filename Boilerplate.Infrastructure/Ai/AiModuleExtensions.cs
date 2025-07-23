using Boilerplate.Infrastructure.Ai.Agent;
using Boilerplate.Infrastructure.Ai.Agent.Configuration;
using Boilerplate.Infrastructure.Ai.LLM.Configuration;
using Boilerplate.Infrastructure.Ai.LLM.Kernel;
using Boilerplate.Infrastructure.Ai.VectorStore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Boilerplate.Infrastructure.Ai;

public static class AiModuleExtensions
{
    public static IServiceCollection AddAiModule(
        this IServiceCollection services,
        IConfigurationManager configuration
    )
    {
        services
            .AddSingleton<AgentService>()
            .AddSingleton<IKernelFactory, KernelFactory>();

        services
            .Configure<LLMOptions>(configuration.GetSection("Ai:LLM"))
            .Configure<AgentOptions>(configuration.GetSection("Ai:Agent"))
            .Configure<EmbeddingOptions>(configuration.GetSection("Ai:Embedding"));

        services
            .AddSingleton<IVectorStore, InMemoryVectorStore>();

        return services;
    }
}