using Education.Api.Contracts;
using Education.Api.Resources;
using Education.Api.Authorization;
using Education.Application.Features.Files.Abstractions;
using Education.Application.Features.Files.Dtos;
using Education.Infrastructure.Identity;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Localization;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class FilesController : ControllerBase
{
    private const string StaffRoles =
        RoleNames.Admin + "," + RoleNames.Teacher + "," + RoleNames.Organize;
    private readonly IFileService _service;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public FilesController(IFileService service, IStringLocalizer<SharedResource> localizer)
    {
        _service = service;
        _localizer = localizer;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<FileItemDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<FileItemDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound(ApiResponse.Fail<FileItemDto>(ApiErrorCodes.NotFound, "File not found."));
        }

        return Ok(ApiResponse.Ok(item));
    }

    [HttpGet("{id:guid}/download")]
    public async Task<IActionResult> Download(Guid id, CancellationToken cancellationToken)
    {
        var result = await _service.DownloadAsync(id, cancellationToken);
        if (result is null)
        {
            return NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "File not found."));
        }

        return File(result.Content, result.ContentType, result.FileName, enableRangeProcessing: true);
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<FileItemDto>>> Upload([FromForm] FileUploadForm request, CancellationToken cancellationToken)
    {
        var file = request?.File;
        if (file is null || file.Length <= 0)
        {
            return BadRequest(ApiResponse.Fail<FileItemDto>(
                ApiErrorCodes.ValidationError,
                _localizer["Error_FileRequired"].Value));
        }

        await using var stream = file.OpenReadStream();
        var created = await _service.UploadAsync(
            new FileUploadRequest(stream, file.FileName, file.ContentType ?? "application/octet-stream", file.Length),
            cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse.Ok(created));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<FileItemDto>>> Replace(
        Guid id,
        [FromForm] FileUploadForm request,
        CancellationToken cancellationToken)
    {
        var file = request?.File;
        if (file is null || file.Length <= 0)
        {
            return BadRequest(ApiResponse.Fail<FileItemDto>(
                ApiErrorCodes.ValidationError,
                _localizer["Error_FileRequired"].Value));
        }

        await using var stream = file.OpenReadStream();
        var updated = await _service.ReplaceAsync(
            id,
            new FileUploadRequest(stream, file.FileName, file.ContentType ?? "application/octet-stream", file.Length),
            cancellationToken);

        if (updated is null)
        {
            return NotFound(ApiResponse.Fail<FileItemDto>(ApiErrorCodes.NotFound, "File not found."));
        }

        return Ok(ApiResponse.Ok(updated));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAsync(id, cancellationToken);
        return deleted
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "File not found."));
    }

    public sealed class FileUploadForm
    {
        [Required]
        public IFormFile File { get; init; } = default!;
    }
}
