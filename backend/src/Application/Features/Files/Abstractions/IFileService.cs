namespace Education.Application.Features.Files.Abstractions;


public interface IFileService
{
    Task<IReadOnlyList<FileItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<FileItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<FileItemDto> UploadAsync(FileUploadRequest request, CancellationToken cancellationToken = default);
    Task<FileItemDto?> ReplaceAsync(Guid id, FileUploadRequest request, CancellationToken cancellationToken = default);
    Task<FileDownloadResult?> DownloadAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
