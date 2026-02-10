namespace Education.Infrastructure.Email;

public sealed class EmailOptions
{
    public bool Enabled { get; set; }
    public string FromEmail { get; set; } = string.Empty;
    public string FromName { get; set; } = "Education";
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; } = 587;
    public string? SmtpUser { get; set; }
    public string? SmtpPass { get; set; }
    public bool EnableSsl { get; set; } = true;
    public string TemplatePath { get; set; } = "EmailTemplates";
    public string AppName { get; set; } = "Education";
    public string SupportEmail { get; set; } = string.Empty;
    public string LoginUrl { get; set; } = string.Empty;
    public string WelcomeSubject { get; set; } = "Welcome to Education";
    public string WelcomeTemplateFile { get; set; } = "welcome.html";
    public string ResetPasswordSubject { get; set; } = "Reset your password";
    public string ResetPasswordTemplateFile { get; set; } = "reset-password.html";
    public int ResetTokenMinutes { get; set; } = 60;
    public string ResetPasswordUrl { get; set; } = string.Empty;
    public string? MobileResetPasswordUrl { get; set; }
}
