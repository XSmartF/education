
using System.ComponentModel.DataAnnotations;
namespace Education.Application.Features.Files.Dtos;

public sealed record FileItemDto(
    Guid Id,
    string FileName,
    string ContentType,
    long Size,
    DateTimeOffset CreatedAt);

public sealed record FileUploadRequest(
    Stream Content,
    string FileName,
    string ContentType,
    long Size);

public sealed record FileDownloadResult(
    Stream Content,
    string FileName,
    string ContentType);
