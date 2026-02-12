namespace Education.Application.Features.Marketplace.Dtos;

public sealed record MarketplaceCatalogItemDto(
    Guid Id,
    string ItemType,
    Guid SellerId,
    string Title,
    string Description,
    decimal Price,
    bool IsFree);

public sealed record PurchaseItemResultDto(
    string ItemType,
    Guid ItemId,
    decimal Amount,
    decimal CommissionAmount,
    decimal SellerPayout,
    decimal BalanceAfter,
    string Status);
