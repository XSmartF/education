namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class WalletRepository : IWalletRepository
{
    private readonly AppDbContext _db;

    public WalletRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Wallet> GetOrCreateWalletAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var wallet = await _db.Wallets.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (wallet is not null)
        {
            return wallet;
        }

        wallet = new Wallet
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Balance = 0m
        };
        await _db.Wallets.AddAsync(wallet, cancellationToken);
        return wallet;
    }

    public Task<Wallet?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _db.Wallets.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public async Task<IReadOnlyList<WalletTransaction>> GetTransactionsAsync(
        Guid walletId,
        int limit,
        CancellationToken cancellationToken = default)
    {
        return await _db.WalletTransactions.AsNoTracking()
            .Where(x => x.WalletId == walletId)
            .OrderByDescending(x => x.CreatedAt)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task AddTransactionAsync(WalletTransaction transaction, CancellationToken cancellationToken = default)
    {
        await _db.WalletTransactions.AddAsync(transaction, cancellationToken);
    }

    public async Task AddWithdrawalAsync(WithdrawalRequest request, CancellationToken cancellationToken = default)
    {
        await _db.WithdrawalRequests.AddAsync(request, cancellationToken);
    }

    public Task<WithdrawalRequest?> GetWithdrawalByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _db.WithdrawalRequests.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<WithdrawalRequest>> GetPendingWithdrawalsAsync(CancellationToken cancellationToken = default)
    {
        return await _db.WithdrawalRequests.AsNoTracking()
            .Where(x => x.Status == "pending")
            .OrderBy(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public void UpdateWithdrawal(WithdrawalRequest request)
    {
        _db.WithdrawalRequests.Update(request);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
