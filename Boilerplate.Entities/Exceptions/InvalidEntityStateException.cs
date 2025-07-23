using Boilerplate.Core.Entities;

namespace Boilerplate.Entities.Exceptions;

public class InvalidEntityStateException : DomainExceptionBase
{
    public InvalidEntityStateException(string message) : base(message)
    {
    }
}