using Boilerplate.Infrastructure.Ai.LLM.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;

namespace Boilerplate.Infrastructure.Ai.LLM.Kernel;

#pragma warning disable SKEXP0010
internal class KernelFactory : IKernelFactory
{
    private readonly LLMOptions _llmOptions;
    private readonly EmbeddingOptions _embeddingOptions;

    public KernelFactory(
        IOptions<LLMOptions> llmOptions,
        IOptions<EmbeddingOptions> embeddingOptions
    )
    {
        _llmOptions = llmOptions.Value;
        _embeddingOptions = embeddingOptions.Value;
    }

    public Microsoft.SemanticKernel.Kernel Create()
    {
        IKernelBuilder builder = Microsoft.SemanticKernel.Kernel.CreateBuilder()
            .AddAzureOpenAIChatCompletion(
                serviceId: "llm",
                deploymentName: _llmOptions.DeploymentName,
                endpoint: _llmOptions.Endpoint,
                apiKey: _llmOptions.ApiKey
            )
            .AddAzureOpenAIEmbeddingGenerator(
                serviceId: "embedding",
                deploymentName: _embeddingOptions.DeploymentName,
                endpoint: _embeddingOptions.Endpoint,
                apiKey: _embeddingOptions.ApiKey
            );

        return builder.Build();
    }
}
#pragma warning restore SKEXP0010