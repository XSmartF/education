namespace Education.Application.Features.Marketplace.Abstractions;

using Education.Application.Features.Marketplace.Dtos;

public interface IMarketplaceService
{
    Task<IReadOnlyList<MarketplaceCatalogItemDto>> GetCatalogAsync(CancellationToken cancellationToken = default);
    Task<PurchaseItemResultDto?> PurchaseCourseAsync(Guid buyerId, Guid courseId, CancellationToken cancellationToken = default);
    Task<PurchaseItemResultDto?> PurchaseDeckAsync(Guid buyerId, Guid deckId, CancellationToken cancellationToken = default);
}
