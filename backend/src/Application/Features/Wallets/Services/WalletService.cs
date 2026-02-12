namespace Education.Application.Features.Wallets.Services;

using Education.Application.Features.Wallets.Abstractions;
using Education.Application.Features.Wallets.Dtos;
using Education.Domain.Entities;
using Education.Domain.Interfaces;

public sealed class WalletService : IWalletService
{
    private readonly IWalletRepository _repository;

    public WalletService(IWalletRepository repository)
    {
        _repository = repository;
    }

    public async Task<WalletOverviewDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var wallet = await _repository.GetByUserIdAsync(userId, cancellationToken);
        if (wallet is null)
        {
            wallet = await _repository.GetOrCreateWalletAsync(userId, cancellationToken);
            await _repository.SaveChangesAsync(cancellationToken);
        }

        var transactions = await _repository.GetTransactionsAsync(wallet.Id, 100, cancellationToken);
        return new WalletOverviewDto(
            userId,
            wallet.Balance,
            transactions.Select(MapTransaction).ToList());
    }

    public async Task<WalletOverviewDto> TopUpAsync(
        Guid userId,
        TopUpWalletRequest request,
        CancellationToken cancellationToken = default)
    {
        var wallet = await _repository.GetOrCreateWalletAsync(userId, cancellationToken);
        wallet.Balance += request.Amount;

        await _repository.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Type = "top_up",
            Amount = request.Amount,
            Description = string.IsNullOrWhiteSpace(request.Note) ? "Top up wallet balance." : request.Note.Trim(),
            ReferenceType = "wallet_top_up",
            ReferenceId = null,
        }, cancellationToken);

        await _repository.SaveChangesAsync(cancellationToken);
        var transactions = await _repository.GetTransactionsAsync(wallet.Id, 100, cancellationToken);
        return new WalletOverviewDto(
            userId,
            wallet.Balance,
            transactions.Select(MapTransaction).ToList());
    }

    public async Task<WithdrawalRequestDto?> RequestWithdrawalAsync(
        Guid userId,
        CreateWithdrawalRequest request,
        CancellationToken cancellationToken = default)
    {
        var wallet = await _repository.GetOrCreateWalletAsync(userId, cancellationToken);
        if (wallet.Balance < request.Amount)
        {
            return null;
        }

        wallet.Balance -= request.Amount;

        await _repository.AddTransactionAsync(new WalletTransaction
        {
            Id = Guid.NewGuid(),
            WalletId = wallet.Id,
            Type = "withdraw_request",
            Amount = -request.Amount,
            Description = "Create withdrawal request.",
            ReferenceType = "withdrawal_request",
            ReferenceId = null,
        }, cancellationToken);

        var withdrawal = new WithdrawalRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = request.Amount,
            Status = "pending",
            Note = string.IsNullOrWhiteSpace(request.Note) ? null : request.Note.Trim(),
        };

        await _repository.AddWithdrawalAsync(withdrawal, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapWithdrawal(withdrawal);
    }

    public async Task<IReadOnlyList<WithdrawalRequestDto>> GetPendingWithdrawalsAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetPendingWithdrawalsAsync(cancellationToken);
        return items.Select(MapWithdrawal).ToList();
    }

    public async Task<WithdrawalRequestDto?> ReviewWithdrawalAsync(
        Guid reviewerId,
        Guid withdrawalId,
        ReviewWithdrawalRequest request,
        CancellationToken cancellationToken = default)
    {
        var withdrawal = await _repository.GetWithdrawalByIdAsync(withdrawalId, cancellationToken);
        if (withdrawal is null)
        {
            return null;
        }

        if (withdrawal.Status != "pending")
        {
            return MapWithdrawal(withdrawal);
        }

        withdrawal.Status = request.Approve ? "approved" : "rejected";
        withdrawal.ReviewedAt = DateTimeOffset.UtcNow;
        withdrawal.ReviewedBy = reviewerId;
        withdrawal.Note = string.IsNullOrWhiteSpace(request.Note) ? withdrawal.Note : request.Note.Trim();
        _repository.UpdateWithdrawal(withdrawal);

        if (!request.Approve)
        {
            var wallet = await _repository.GetOrCreateWalletAsync(withdrawal.UserId, cancellationToken);
            wallet.Balance += withdrawal.Amount;
            await _repository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = wallet.Id,
                Type = "withdraw_refund",
                Amount = withdrawal.Amount,
                Description = "Refund withdrawal request.",
                ReferenceType = "withdrawal_request",
                ReferenceId = withdrawal.Id,
            }, cancellationToken);
        }

        await _repository.SaveChangesAsync(cancellationToken);
        return MapWithdrawal(withdrawal);
    }

    private static WalletTransactionDto MapTransaction(WalletTransaction transaction)
    {
        return new WalletTransactionDto(
            transaction.Id,
            transaction.Type,
            transaction.Amount,
            transaction.Description,
            transaction.ReferenceType,
            transaction.ReferenceId,
            transaction.CreatedAt);
    }

    private static WithdrawalRequestDto MapWithdrawal(WithdrawalRequest request)
    {
        return new WithdrawalRequestDto(
            request.Id,
            request.UserId,
            request.Amount,
            request.Status,
            request.Note,
            request.CreatedAt,
            request.ReviewedAt,
            request.ReviewedBy);
    }
}
