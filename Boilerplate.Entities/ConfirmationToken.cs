using Boilerplate.Core.Entities;
using Boilerplate.Entities.Exceptions;

namespace Boilerplate.Entities;

public class ConfirmationToken : IEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; private set; } = DateTimeOffset.UtcNow.AddHours(1);
    public DateTimeOffset? ConfirmedAt { get; private set; }

    public ConfirmationToken(string token, User user) : this(token, user.Id)
    {
        User = user;
    }

    public ConfirmationToken(string token, int userId)
    {
        Token = token;
        UserId = userId;
    }

    private ConfirmationToken() {}

    public void Confirm()
    {
        if (ExpiresAt <= DateTimeOffset.UtcNow)
        {
            throw new InvalidConfirmationTokenException();
        }

        if (ConfirmedAt.HasValue) throw new InvalidConfirmationTokenException();

        ConfirmedAt = DateTimeOffset.UtcNow;
    }
}