using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Application.Abstractions;
using Education.Application.Features.Reputation.Abstractions;
using Education.Application.Features.Reputation.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class ReputationController : ControllerBase
{
    private readonly IReputationService _service;
    private readonly ICurrentUser _currentUser;

    public ReputationController(IReputationService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<ReputationProfileDto>>> GetMine(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(ApiResponse.Fail<ReputationProfileDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var profile = await _service.GetMyProfileAsync(userId, cancellationToken);
        return Ok(ApiResponse.Ok(profile));
    }

    [HttpGet("{userId:guid}")]
    public async Task<ActionResult<ApiResponse<ReputationProfileDto>>> GetByUserId(Guid userId, CancellationToken cancellationToken)
    {
        var profile = await _service.GetByUserIdAsync(userId, cancellationToken);
        if (profile is null)
        {
            return NotFound(ApiResponse.Fail<ReputationProfileDto>(ApiErrorCodes.NotFound, "Reputation profile not found."));
        }

        return Ok(ApiResponse.Ok(profile));
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        return Guid.TryParse(_currentUser.UserId, out userId);
    }
}
