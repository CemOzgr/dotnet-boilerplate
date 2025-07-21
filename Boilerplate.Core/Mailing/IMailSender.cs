namespace Boilerplate.Core.Mailing;

public interface IMailSender
{
    Task SendAsync(
        MailData mail,
        CancellationToken cancellationToken = default
    );
}