using Education.Domain.Entities;

namespace Education.Domain.Interfaces;

public interface IWalletRepository
{
    Task<Wallet> GetOrCreateWalletAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Wallet?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WalletTransaction>> GetTransactionsAsync(Guid walletId, int limit, CancellationToken cancellationToken = default);
    Task AddTransactionAsync(WalletTransaction transaction, CancellationToken cancellationToken = default);
    Task AddWithdrawalAsync(WithdrawalRequest request, CancellationToken cancellationToken = default);
    Task<WithdrawalRequest?> GetWithdrawalByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WithdrawalRequest>> GetPendingWithdrawalsAsync(CancellationToken cancellationToken = default);
    void UpdateWithdrawal(WithdrawalRequest request);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
