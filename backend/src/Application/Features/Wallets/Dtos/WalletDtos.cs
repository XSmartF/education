namespace Education.Application.Features.Wallets.Dtos;

using System.ComponentModel.DataAnnotations;

public sealed record WalletTransactionDto(
    Guid Id,
    string Type,
    decimal Amount,
    string Description,
    string? ReferenceType,
    Guid? ReferenceId,
    DateTimeOffset CreatedAt);

public sealed record WalletOverviewDto(
    Guid UserId,
    decimal Balance,
    IReadOnlyList<WalletTransactionDto> Transactions);

public sealed record TopUpWalletRequest(
    [Range(0.01, 100000000)] decimal Amount,
    [MaxLength(300)] string? Note);

public sealed record CreateWithdrawalRequest(
    [Range(0.01, 100000000)] decimal Amount,
    [MaxLength(1000)] string? Note);

public sealed record ReviewWithdrawalRequest(
    bool Approve,
    [MaxLength(1000)] string? Note);

public sealed record WithdrawalRequestDto(
    Guid Id,
    Guid UserId,
    decimal Amount,
    string Status,
    string? Note,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ReviewedAt,
    Guid? ReviewedBy);
