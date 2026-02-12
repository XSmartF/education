namespace Education.Application.Features.Wallets.Abstractions;

using Education.Application.Features.Wallets.Dtos;

public interface IWalletService
{
    Task<WalletOverviewDto> GetWalletAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<WalletOverviewDto> TopUpAsync(Guid userId, TopUpWalletRequest request, CancellationToken cancellationToken = default);
    Task<WithdrawalRequestDto?> RequestWithdrawalAsync(Guid userId, CreateWithdrawalRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<WithdrawalRequestDto>> GetPendingWithdrawalsAsync(CancellationToken cancellationToken = default);
    Task<WithdrawalRequestDto?> ReviewWithdrawalAsync(Guid reviewerId, Guid withdrawalId, ReviewWithdrawalRequest request, CancellationToken cancellationToken = default);
}
