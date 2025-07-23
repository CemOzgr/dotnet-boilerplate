namespace Boilerplate.Infrastructure.Ai.LLM.Kernel;

public interface IKernelFactory
{
    Microsoft.SemanticKernel.Kernel Create();
}