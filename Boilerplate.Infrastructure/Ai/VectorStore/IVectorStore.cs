using Boilerplate.Infrastructure.Ai.VectorStore.Models;

namespace Boilerplate.Infrastructure.Ai.VectorStore;

public interface IVectorStore
{
    Microsoft.Extensions.VectorData.VectorStore GetKernelVectorStore();

    Task UpsertAsync(
        string collectionName,
        IEnumerable<VectorStoreRecord> records,
        CancellationToken cancellationToken = default
    );

    Task<IEnumerable<VectorStoreRecord>> SearchAsync(
        string collectionName,
        float[] embedding,
        int limit = 3,
        CancellationToken cancellationToken = default
    );

    Task DeleteAsync(
        string collectionName,
        IEnumerable<string> ids,
        CancellationToken cancellationToken = default
    );
}