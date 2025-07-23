using Boilerplate.Core.Entities;

namespace Boilerplate.Entities.Exceptions;

public class EntityNotFoundException : DomainExceptionBase
{
    public EntityNotFoundException(string entityName) : base($"{entityName} not found")
    {
    }
}