using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Application.Abstractions;
using Education.Application.Features.Marketplace.Abstractions;
using Education.Application.Features.Marketplace.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class MarketplaceController : ControllerBase
{
    private readonly IMarketplaceService _service;
    private readonly ICurrentUser _currentUser;

    public MarketplaceController(IMarketplaceService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet("catalog")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<MarketplaceCatalogItemDto>>>> GetCatalog(CancellationToken cancellationToken)
    {
        var items = await _service.GetCatalogAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpPost("courses/{courseId:guid}/purchase")]
    public async Task<ActionResult<ApiResponse<PurchaseItemResultDto>>> PurchaseCourse(Guid courseId, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var buyerId))
        {
            return Unauthorized(ApiResponse.Fail<PurchaseItemResultDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        try
        {
            var result = await _service.PurchaseCourseAsync(buyerId, courseId, cancellationToken);
            if (result is null)
            {
                return NotFound(ApiResponse.Fail<PurchaseItemResultDto>(ApiErrorCodes.NotFound, "Course not found."));
            }

            return Ok(ApiResponse.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "insufficient_funds")
        {
            return BadRequest(ApiResponse.Fail<PurchaseItemResultDto>(
                ApiErrorCodes.InsufficientFunds,
                "Insufficient wallet balance."));
        }
    }

    [HttpPost("decks/{deckId:guid}/purchase")]
    public async Task<ActionResult<ApiResponse<PurchaseItemResultDto>>> PurchaseDeck(Guid deckId, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var buyerId))
        {
            return Unauthorized(ApiResponse.Fail<PurchaseItemResultDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        try
        {
            var result = await _service.PurchaseDeckAsync(buyerId, deckId, cancellationToken);
            if (result is null)
            {
                return NotFound(ApiResponse.Fail<PurchaseItemResultDto>(ApiErrorCodes.NotFound, "Deck not found."));
            }

            return Ok(ApiResponse.Ok(result));
        }
        catch (InvalidOperationException ex) when (ex.Message == "insufficient_funds")
        {
            return BadRequest(ApiResponse.Fail<PurchaseItemResultDto>(
                ApiErrorCodes.InsufficientFunds,
                "Insufficient wallet balance."));
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        return Guid.TryParse(_currentUser.UserId, out userId);
    }
}
