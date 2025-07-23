using Azure;
using Azure.AI.OpenAI;
using Boilerplate.Infrastructure.Ai.LLM.Configuration;
using Boilerplate.Infrastructure.Ai.VectorStore.Models;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel.Connectors.InMemory;

namespace Boilerplate.Infrastructure.Ai.VectorStore;

internal class InMemoryVectorStore : IVectorStore
{
    private readonly Microsoft.Extensions.VectorData.VectorStore _vectorStore;

    public InMemoryVectorStore(IOptions<EmbeddingOptions> embeddingOptions)
    {
        EmbeddingOptions options = embeddingOptions.Value;

        IEmbeddingGenerator<string, Embedding<float>> embeddingGenerator = new AzureOpenAIClient(
                new Uri(options.Endpoint),
                new AzureKeyCredential(options.ApiKey)
            )
            .GetEmbeddingClient(options.DeploymentName)
            .AsIEmbeddingGenerator(options.Dimension);


        //TODO: Dispose etmek lazım ama zaten öylesine bu
        Microsoft.SemanticKernel.Connectors.InMemory.InMemoryVectorStore vectorStore = new(
            new InMemoryVectorStoreOptions { EmbeddingGenerator = embeddingGenerator }
        );

        _vectorStore = vectorStore;
    }

    public Microsoft.Extensions.VectorData.VectorStore GetKernelVectorStore() => _vectorStore;

    public Task UpsertAsync(
        string collectionName,
        IEnumerable<VectorStoreRecord> records,
        CancellationToken cancellationToken = default
    )
    {
        VectorStoreCollection<string, VectorStoreRecord> collection = _vectorStore.GetCollection<string, VectorStoreRecord>(
            collectionName
        );

        return collection.UpsertAsync(records, cancellationToken);
    }

    public async Task<IEnumerable<VectorStoreRecord>> SearchAsync(
        string collectionName,
        float[] embedding,
        int limit = 3,
        CancellationToken cancellationToken = default
    )
    {
        VectorStoreCollection<string, VectorStoreRecord> collection = _vectorStore.GetCollection<string, VectorStoreRecord>(
            collectionName
        );

        IAsyncEnumerable<VectorSearchResult<VectorStoreRecord>> hmm =  collection.SearchAsync(
            embedding,
            limit,
            cancellationToken: cancellationToken
        );

        List<VectorStoreRecord> results = [];

        await foreach (VectorSearchResult<VectorStoreRecord> result in hmm)
        {
            results.Add(result.Record);
        }

        return results;
    }

    public async Task DeleteAsync(
        string collectionName,
        IEnumerable<string> ids,
        CancellationToken cancellationToken = default
    )
    {
        VectorStoreCollection<string, VectorStoreRecord> collection = _vectorStore.GetCollection<string, VectorStoreRecord>(
            collectionName
        );

        await collection.DeleteAsync(ids, cancellationToken);
    }
}