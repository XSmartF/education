namespace Education.Application.Abstractions;

public interface IFileStorage
{
    Task SaveAsync(string relativePath, Stream content, CancellationToken cancellationToken = default);
    Task<Stream?> OpenReadAsync(string relativePath, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string relativePath, CancellationToken cancellationToken = default);
}
