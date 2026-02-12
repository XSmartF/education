using Education.Domain.Entities;

namespace Education.Domain.Interfaces;

public interface IDeckRepository
{
    Task<IReadOnlyList<Deck>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Deck>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task<Deck?> GetByIdAsync(Guid id, bool includeDetails = false, CancellationToken cancellationToken = default);
    Task<DeckPurchase?> GetPurchaseAsync(Guid deckId, Guid buyerId, CancellationToken cancellationToken = default);
    Task AddDeckAsync(Deck deck, CancellationToken cancellationToken = default);
    Task AddCardAsync(DeckCard card, CancellationToken cancellationToken = default);
    Task AddPurchaseAsync(DeckPurchase purchase, CancellationToken cancellationToken = default);
    void UpdateDeck(Deck deck);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
