namespace Boilerplate.Infrastructure.Ai.LLM.Configuration;

public class EmbeddingOptions
{
    public string DeploymentName { get; set; }
    public string Endpoint { get; set; }
    public string ApiKey { get; set; }
    public int Dimension { get; set; } = 1536;
}