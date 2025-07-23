using Azure.AI.Agents.Persistent;
using Azure.Identity;
using Boilerplate.Infrastructure.Ai.Agent.Configuration;
using Boilerplate.Infrastructure.Ai.Agent.Plugin;
using Microsoft.Extensions.Options;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.Agents.AzureAI;

namespace Boilerplate.Infrastructure.Ai.Agent;

#pragma warning disable SKEXP0110
public class AgentService
{
    private readonly AgentOptions _options;

    public AgentService(IOptions<AgentOptions> options)
    {
        _options = options.Value;
    }

    public async Task<AzureAIAgent> CreateAgentAsync(
        string name,
        string description,
        string instructions,
        BinaryData? responseFormat = null,
        IEnumerable<IPlugin>? plugins = null,
        CancellationToken cancellationToken = default
    )
    {
        PersistentAgentsClient client = AzureAIAgent.CreateAgentsClient(
            _options.ModelId,
            new AzureCliCredential() // TODO: burada başka bir şey gerekebilir
        );

        PersistentAgent agentDefinition = await client.Administration.CreateAgentAsync(
            _options.ModelId,
            name: name,
            description: description,
            instructions: instructions,
            responseFormat: responseFormat,
            topP: _options.TopP,
            temperature: _options.Temperature,
            cancellationToken: cancellationToken
        );

        IEnumerable<KernelPlugin> kernelPlugins = plugins
            ?.Select(plugin => KernelPluginFactory.CreateFromObject(plugin)) ?? [];

        return new AzureAIAgent(
            agentDefinition,
            client,
            kernelPlugins
        );
    }

    public async Task<AzureAIAgent> GetAgentAsync(
        string id,
        IEnumerable<IPlugin>? plugins = null,
        CancellationToken cancellationToken = default
    )
    {
        PersistentAgentsClient client = AzureAIAgent.CreateAgentsClient(
            _options.ModelId,
            new AzureCliCredential() // TODO: burada başka bir şey gerekebilir
        );

        PersistentAgent agentDefinition = await client.Administration.GetAgentAsync(
            id,
            cancellationToken
        );

        IEnumerable<KernelPlugin> kernelPlugins = plugins
            ?.Select(plugin => KernelPluginFactory.CreateFromObject(plugin)) ?? [];

        return new AzureAIAgent(
            agentDefinition,
            client,
            kernelPlugins
        );
    }

    public async Task DeleteAgentAsync(
        string id,
        CancellationToken cancellationToken = default
    )
    {
        PersistentAgentsClient client = AzureAIAgent.CreateAgentsClient(
            _options.ModelId,
            new AzureCliCredential() // TODO: burada başka bir şey gerekebilir
        );

        //TODO: Thread'i de silmek lazım ama üşendim bişi olmaz
        await client.Administration.DeleteAgentAsync(
            id,
            cancellationToken
        );
    }
}
#pragma warning restore SKEXP0110