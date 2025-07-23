namespace Boilerplate.Infrastructure.Ai.VectorStore.Models;

public record VectorStoreRecord(
    string Id,
    string DocumentName,
    string Text,
    float[] Embedding
);