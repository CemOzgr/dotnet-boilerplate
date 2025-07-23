using Boilerplate.Core.Entities;

namespace Boilerplate.Entities.Exceptions;

public class InvalidConfirmationTokenException : DomainExceptionBase
{
    public InvalidConfirmationTokenException() : base("Invalid or Expired Token")
    {
    }
}