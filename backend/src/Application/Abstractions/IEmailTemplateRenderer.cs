namespace Education.Application.Abstractions;

public interface IEmailTemplateRenderer
{
    Task<string> RenderAsync(
        string templateName,
        IReadOnlyDictionary<string, string> tokens,
        CancellationToken cancellationToken = default);
}
