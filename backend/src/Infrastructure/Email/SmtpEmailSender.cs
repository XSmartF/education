namespace Education.Infrastructure.Email;

using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Text;
using Education.Application.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly EmailOptions _options;
    private readonly ILogger<SmtpEmailSender> _logger;

    public SmtpEmailSender(IOptions<EmailOptions> options, ILogger<SmtpEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendAsync(EmailMessage message, CancellationToken cancellationToken = default)
    {
        if (!_options.Enabled || string.IsNullOrWhiteSpace(_options.SmtpHost))
        {
            _logger.LogWarning("Email sending disabled or SMTP host missing. Skipping email to {Email}.", message.To);
            _logger.LogInformation("Subject: {Subject}", message.Subject);
            _logger.LogInformation("Body: {Body}", message.TextBody ?? message.HtmlBody);
            return;
        }

        var fromEmail = string.IsNullOrWhiteSpace(message.FromEmail) ? _options.FromEmail : message.FromEmail;
        var fromName = string.IsNullOrWhiteSpace(message.FromName) ? _options.FromName : message.FromName;

        if (string.IsNullOrWhiteSpace(fromEmail))
        {
            throw new InvalidOperationException("Email sender address is not configured.");
        }

        using var smtp = new SmtpClient(_options.SmtpHost, _options.SmtpPort)
        {
            EnableSsl = _options.EnableSsl,
        };

        if (!string.IsNullOrWhiteSpace(_options.SmtpUser))
        {
            smtp.Credentials = new NetworkCredential(_options.SmtpUser, _options.SmtpPass);
        }

        using var mail = new MailMessage
        {
            From = new MailAddress(fromEmail, fromName),
            Subject = message.Subject,
            Body = message.HtmlBody,
            IsBodyHtml = true,
            BodyEncoding = Encoding.UTF8,
            SubjectEncoding = Encoding.UTF8,
        };

        mail.To.Add(message.To);

        if (!string.IsNullOrWhiteSpace(message.TextBody))
        {
            var plainView = AlternateView.CreateAlternateViewFromString(
                message.TextBody,
                Encoding.UTF8,
                MediaTypeNames.Text.Plain);
            mail.AlternateViews.Add(plainView);
        }

        cancellationToken.ThrowIfCancellationRequested();
        await smtp.SendMailAsync(mail);
    }
}
