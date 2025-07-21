using System.Net;
using Boilerplate.Core.Mailing;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace Boilerplate.Infrastructure.Mailing;

internal class MailKitMailSender : IMailSender
{
    private readonly EmailOptions _emailOptions;

    public MailKitMailSender(
        IOptions<EmailOptions> emailOptions
    )
    {
        _emailOptions = emailOptions.Value;
    }

    public async Task SendAsync(
        MailData mail,
        CancellationToken cancellationToken = default
    )
    {
        IEnumerable<MailboxAddress> addresses = mail.ToList
            .Select(to => new MailboxAddress("", to));

        MimeMessage message = new();
        message.From.Add(
            new MailboxAddress(
                string.IsNullOrEmpty(mail.DisplayName?.Trim())
                    ? _emailOptions.DisplayName
                    : mail.DisplayName?.Trim(),
                _emailOptions.From
            )
        );
        message.To.AddRange(addresses);
        message.Subject = mail.Subject;

        BodyBuilder builder = new() { HtmlBody = mail.Body };

        if(mail.Attachments != null)
        {
            Task<MimeEntity>[] attachmentTasks = mail.Attachments
                .Select(attachment => builder.Attachments.AddAsync(
                    attachment.Name, new MemoryStream(attachment.Content),
                    cancellationToken)
                ).ToArray();

            await Task.WhenAll(attachmentTasks);
        }

        message.Body = builder.ToMessageBody();

        using SmtpClient client = new()
        {
            CheckCertificateRevocation = false
        };

        try
        {
            NetworkCredential credential = new(
                _emailOptions.Username,
                _emailOptions.Password
            );

            await client.ConnectAsync(
                    _emailOptions.SMTPServer,
                    _emailOptions.SMTPPort,
                    SecureSocketOptions.StartTls,
                    cancellationToken
                )
                .ConfigureAwait(false);

            await client.AuthenticateAsync(
                    credential,
                    cancellationToken
                )
                .ConfigureAwait(false);

            await client.SendAsync(
                message,
                cancellationToken
            );
        }
        catch(Exception ex)
        {
            throw new InvalidOperationException("Error sending email", ex);
        }
        finally
        {
            await client.DisconnectAsync(true, cancellationToken);
        }
    }
}