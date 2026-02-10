namespace Education.Infrastructure.Email;

using System.Text.Encodings.Web;
using Education.Application.Abstractions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

public sealed class EmailTemplateRenderer : IEmailTemplateRenderer
{
    private const string ResetPasswordTemplateName = "reset-password";
    private const string WelcomeTemplateName = "welcome";
    private readonly IHostEnvironment _environment;
    private readonly EmailOptions _options;
    private readonly ILogger<EmailTemplateRenderer> _logger;

    public EmailTemplateRenderer(
        IHostEnvironment environment,
        IOptions<EmailOptions> options,
        ILogger<EmailTemplateRenderer> logger)
    {
        _environment = environment;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<string> RenderAsync(
        string templateName,
        IReadOnlyDictionary<string, string> tokens,
        CancellationToken cancellationToken = default)
    {
        var fileName = templateName;
        if (!Path.HasExtension(fileName))
        {
            fileName += ".html";
        }

        var path = Path.Combine(_environment.ContentRootPath, _options.TemplatePath, fileName);
        string template;

        if (File.Exists(path))
        {
            template = await File.ReadAllTextAsync(path, cancellationToken);
        }
        else
        {
            template = GetFallbackTemplate(templateName);
            _logger.LogWarning("Email template not found at {Path}. Using fallback.", path);
        }

        return ReplaceTokens(template, tokens);
    }

    private string GetFallbackTemplate(string templateName)
    {
        if (templateName.Equals(ResetPasswordTemplateName, StringComparison.OrdinalIgnoreCase) ||
            templateName.Equals(_options.ResetPasswordTemplateFile, StringComparison.OrdinalIgnoreCase))
        {
            return """
                   <!doctype html>
                   <html lang="en">
                     <head>
                       <meta charset="utf-8" />
                       <meta name="viewport" content="width=device-width, initial-scale=1" />
                       <title>{{AppName}} - Reset Password</title>
                     </head>
                     <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px;">
                       <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px;">
                         <h2 style="margin-top: 0;">Reset your password</h2>
                         <p>Hi {{DisplayName}},</p>
                         <p>We received a request to reset your {{AppName}} password.</p>
                         <p style="margin: 24px 0;">
                           <a href="{{ResetUrl}}" style="background:#1d4ed8;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;">
                             Reset password
                           </a>
                         </p>
                         <p>This link expires in {{ExpiresMinutes}} minutes.</p>
                         <p>If you didn't request this, you can ignore this email.</p>
                         <p style="margin-top: 24px;">Need help? Contact {{SupportEmail}}</p>
                       </div>
                     </body>
                   </html>
                   """;
        }

        if (templateName.Equals(WelcomeTemplateName, StringComparison.OrdinalIgnoreCase) ||
            templateName.Equals(_options.WelcomeTemplateFile, StringComparison.OrdinalIgnoreCase))
        {
            return """
                   <!doctype html>
                   <html lang="en">
                     <head>
                       <meta charset="utf-8" />
                       <meta name="viewport" content="width=device-width, initial-scale=1" />
                       <title>Welcome to {{AppName}}</title>
                     </head>
                     <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 24px;">
                       <div style="max-width: 520px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 12px;">
                         <h2 style="margin-top: 0;">Welcome to {{AppName}}</h2>
                         <p>Hi {{DisplayName}},</p>
                         <p>Your account is ready. You can now sign in and start using {{AppName}}.</p>
                         <p style="margin: 24px 0;">
                           <a href="{{LoginUrl}}" style="background:#1d4ed8;color:#ffffff;padding:12px 20px;border-radius:8px;text-decoration:none;">
                             Go to sign in
                           </a>
                         </p>
                         <p>If you need help, contact {{SupportEmail}}.</p>
                       </div>
                     </body>
                   </html>
                   """;
        }

        return string.Empty;
    }

    private static string ReplaceTokens(string template, IReadOnlyDictionary<string, string> tokens)
    {
        if (string.IsNullOrWhiteSpace(template))
        {
            return string.Empty;
        }

        var result = template;
        foreach (var (key, value) in tokens)
        {
            var safeValue = HtmlEncoder.Default.Encode(value ?? string.Empty);
            result = result.Replace($"{{{{{key}}}}}", safeValue, StringComparison.OrdinalIgnoreCase);
        }

        return result;
    }
}
