using Boilerplate.Core.Entities;

namespace Boilerplate.Entities.Exceptions;

public class DuplicateUserException : DomainExceptionBase
{
    public DuplicateUserException(string message) : base(message)
    {
    }
}