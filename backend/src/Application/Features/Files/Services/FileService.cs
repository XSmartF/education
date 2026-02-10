namespace Education.Application.Features.Files.Services;

using AutoMapper;
using Education.Application.Features.Files.Abstractions;
using Education.Application.Features.Files.Dtos;
using Education.Domain.Entities;

public sealed class FileService : IFileService
{
    private static readonly string UploadFolder = "uploads";
    private readonly IFileRepository _repository;
    private readonly IFileStorage _storage;
    private readonly IMapper _mapper;

    public FileService(IFileRepository repository, IFileStorage storage, IMapper mapper)
    {
        _repository = repository;
        _storage = storage;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<FileItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        return items.Select(item => _mapper.Map<FileItemDto>(item)).ToList();
    }

    public async Task<FileItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        return item is null ? null : _mapper.Map<FileItemDto>(item);
    }

    public async Task<FileItemDto> UploadAsync(FileUploadRequest request, CancellationToken cancellationToken = default)
    {
        var safeName = Path.GetFileName(request.FileName);
        var extension = Path.GetExtension(safeName);
        var storedName = $"{Guid.NewGuid():N}{extension}";
        var relativePath = Path.Combine(UploadFolder, storedName);

        await _storage.SaveAsync(relativePath, request.Content, cancellationToken);

        var entity = new StoredFile
        {
            Id = Guid.NewGuid(),
            OriginalName = safeName,
            StoredName = storedName,
            ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? "application/octet-stream" : request.ContentType,
            Size = request.Size,
            RelativePath = relativePath
        };

        await _repository.AddAsync(entity, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<FileItemDto>(entity);
    }

    public async Task<FileItemDto?> ReplaceAsync(Guid id, FileUploadRequest request, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var safeName = Path.GetFileName(request.FileName);
        var extension = Path.GetExtension(safeName);
        var storedName = $"{Guid.NewGuid():N}{extension}";
        var relativePath = Path.Combine(UploadFolder, storedName);

        await _storage.SaveAsync(relativePath, request.Content, cancellationToken);
        await _storage.DeleteAsync(entity.RelativePath, cancellationToken);

        entity.OriginalName = safeName;
        entity.StoredName = storedName;
        entity.ContentType = string.IsNullOrWhiteSpace(request.ContentType) ? "application/octet-stream" : request.ContentType;
        entity.Size = request.Size;
        entity.RelativePath = relativePath;
        _repository.Update(entity);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<FileItemDto>(entity);
    }

    public async Task<FileDownloadResult?> DownloadAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        var stream = await _storage.OpenReadAsync(entity.RelativePath, cancellationToken);
        if (stream is null)
        {
            return null;
        }

        return new FileDownloadResult(stream, entity.OriginalName, entity.ContentType);
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _repository.GetByIdAsync(id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        await _storage.DeleteAsync(entity.RelativePath, cancellationToken);

        _repository.Remove(entity);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

}
