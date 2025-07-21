namespace Boilerplate.Core.Entities;

public abstract class DomainExceptionBase : Exception
{
    protected DomainExceptionBase(string message) : base(message)
    {
    }
}