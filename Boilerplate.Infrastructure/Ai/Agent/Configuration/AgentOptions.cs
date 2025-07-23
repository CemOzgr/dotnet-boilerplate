namespace Boilerplate.Infrastructure.Ai.Agent.Configuration;

public class AgentOptions
{
    public string ModelId { get; set; } = string.Empty;
    public string Endpoint { get; set; } = string.Empty;
    public float Temperature { get; set; } = 0f;
    public float TopP { get; set; } = 0f;
}