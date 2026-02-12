using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Application.Abstractions;
using Education.Application.Features.Decks.Abstractions;
using Education.Application.Features.Decks.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class DecksController : ControllerBase
{
    private readonly IDeckService _service;
    private readonly ICurrentUser _currentUser;

    public DecksController(IDeckService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DeckItemDto>>>> GetPublished(CancellationToken cancellationToken)
    {
        var items = await _service.GetPublishedAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<DeckItemDto>>>> GetMine(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
        {
            return Unauthorized(ApiResponse.Fail<IReadOnlyList<DeckItemDto>>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var items = await _service.GetByOwnerAsync(ownerId, cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeckDetailDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound(ApiResponse.Fail<DeckDetailDto>(ApiErrorCodes.NotFound, "Deck not found."));
        }

        return Ok(ApiResponse.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<DeckDetailDto>>> Create(
        [FromBody] CreateDeckRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
        {
            return Unauthorized(ApiResponse.Fail<DeckDetailDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var created = await _service.CreateAsync(ownerId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse.Ok(created));
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<DeckDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateDeckRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
        {
            return Unauthorized(ApiResponse.Fail<DeckDetailDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var updated = await _service.UpdateAsync(ownerId, id, request, cancellationToken);
        if (updated is null)
        {
            return NotFound(ApiResponse.Fail<DeckDetailDto>(ApiErrorCodes.NotFound, "Deck not found."));
        }

        return Ok(ApiResponse.Ok(updated));
    }

    [HttpPost("{id:guid}/cards")]
    public async Task<ActionResult<ApiResponse<DeckCardDto>>> AddCard(
        Guid id,
        [FromBody] CreateDeckCardRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
        {
            return Unauthorized(ApiResponse.Fail<DeckCardDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var card = await _service.AddCardAsync(ownerId, id, request, cancellationToken);
        if (card is null)
        {
            return NotFound(ApiResponse.Fail<DeckCardDto>(ApiErrorCodes.NotFound, "Deck not found."));
        }

        return Ok(ApiResponse.Ok(card));
    }

    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<object?>>> Publish(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
        {
            return Unauthorized(ApiResponse.Fail(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var ok = await _service.PublishAsync(ownerId, id, cancellationToken);
        return ok
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Deck not found."));
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        return Guid.TryParse(_currentUser.UserId, out userId);
    }
}
