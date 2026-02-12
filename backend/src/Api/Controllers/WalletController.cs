using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Application.Abstractions;
using Education.Application.Features.Wallets.Abstractions;
using Education.Application.Features.Wallets.Dtos;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class WalletController : ControllerBase
{
    private readonly IWalletService _service;
    private readonly ICurrentUser _currentUser;

    public WalletController(IWalletService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<WalletOverviewDto>>> GetMyWallet(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(ApiResponse.Fail<WalletOverviewDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var wallet = await _service.GetWalletAsync(userId, cancellationToken);
        return Ok(ApiResponse.Ok(wallet));
    }

    [HttpPost("top-up")]
    public async Task<ActionResult<ApiResponse<WalletOverviewDto>>> TopUp(
        [FromBody] TopUpWalletRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(ApiResponse.Fail<WalletOverviewDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var wallet = await _service.TopUpAsync(userId, request, cancellationToken);
        return Ok(ApiResponse.Ok(wallet));
    }

    [HttpPost("withdrawals")]
    public async Task<ActionResult<ApiResponse<WithdrawalRequestDto>>> RequestWithdrawal(
        [FromBody] CreateWithdrawalRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(ApiResponse.Fail<WithdrawalRequestDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var result = await _service.RequestWithdrawalAsync(userId, request, cancellationToken);
        if (result is null)
        {
            return BadRequest(ApiResponse.Fail<WithdrawalRequestDto>(
                ApiErrorCodes.InsufficientFunds,
                "Insufficient wallet balance."));
        }

        return Ok(ApiResponse.Ok(result));
    }

    [Authorize(Roles = RoleNames.Admin)]
    [HttpGet("withdrawals/pending")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<WithdrawalRequestDto>>>> GetPendingWithdrawals(CancellationToken cancellationToken)
    {
        var items = await _service.GetPendingWithdrawalsAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [Authorize(Roles = RoleNames.Admin)]
    [HttpPost("withdrawals/{id:guid}/review")]
    public async Task<ActionResult<ApiResponse<WithdrawalRequestDto>>> ReviewWithdrawal(
        Guid id,
        [FromBody] ReviewWithdrawalRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var reviewerId))
        {
            return Unauthorized(ApiResponse.Fail<WithdrawalRequestDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var reviewed = await _service.ReviewWithdrawalAsync(reviewerId, id, request, cancellationToken);
        if (reviewed is null)
        {
            return NotFound(ApiResponse.Fail<WithdrawalRequestDto>(ApiErrorCodes.NotFound, "Withdrawal request not found."));
        }

        return Ok(ApiResponse.Ok(reviewed));
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        return Guid.TryParse(_currentUser.UserId, out userId);
    }
}
