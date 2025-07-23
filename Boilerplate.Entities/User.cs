using Boilerplate.Core.Entities;
using Boilerplate.Entities.Exceptions;

namespace Boilerplate.Entities;

public class User : IEntity
{
    public int Id { get; set; }

    public string Name { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public string PasswordSalt { get; set; }

    public DateTimeOffset? ActivatedAt { get; private set; }
    public DateTimeOffset? DeactivatedAt { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; } = DateTimeOffset.UtcNow;

    public List<Role> Roles { get; set; } = [];

    private List<ConfirmationToken>? _confirmationTokens;
    public IReadOnlyList<ConfirmationToken> ConfirmationTokens => _confirmationTokens ??= [];

    public void AssignConfirmationToken(string token)
    {
        if (ActivatedAt != null)
        {
            throw new InvalidEntityStateException(
                "Cannot assign confirmation token to an activated user."
            );
        }

        _confirmationTokens ??= [];

        _confirmationTokens.Add(new ConfirmationToken(token, this));
    }

    public void Activate()
    {
        if (ActivatedAt != null) return;
        ActivatedAt = DateTimeOffset.UtcNow;

        ConfirmationToken? token = _confirmationTokens?.MaxBy(t => t.CreatedAt);

        if (token is not { ConfirmedAt: null })
        {
            throw new InvalidEntityStateException("No valid confirmation token found.");
        }

        if (token.ExpiresAt < DateTimeOffset.UtcNow)
        {
            throw new InvalidEntityStateException("Confirmation token has expired.");
        }

        token.Confirm();
    }

    public void Deactivate() => DeactivatedAt ??= DateTimeOffset.UtcNow;
}