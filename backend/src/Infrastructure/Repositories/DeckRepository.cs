namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class DeckRepository : IDeckRepository
{
    private readonly AppDbContext _db;

    public DeckRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Deck>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Decks.AsNoTracking()
            .Where(x => x.IsPublished && x.Visibility != "private")
            .Include(x => x.Cards)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Deck>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _db.Decks.AsNoTracking()
            .Where(x => x.OwnerId == ownerId)
            .Include(x => x.Cards)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Deck?> GetByIdAsync(Guid id, bool includeDetails = false, CancellationToken cancellationToken = default)
    {
        IQueryable<Deck> query = _db.Decks;
        if (includeDetails)
        {
            query = query.Include(x => x.Cards).Include(x => x.Purchases);
        }

        return query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<DeckPurchase?> GetPurchaseAsync(Guid deckId, Guid buyerId, CancellationToken cancellationToken = default)
    {
        return _db.DeckPurchases.FirstOrDefaultAsync(
            x => x.DeckId == deckId && x.BuyerId == buyerId,
            cancellationToken);
    }

    public async Task AddDeckAsync(Deck deck, CancellationToken cancellationToken = default)
    {
        await _db.Decks.AddAsync(deck, cancellationToken);
    }

    public async Task AddCardAsync(DeckCard card, CancellationToken cancellationToken = default)
    {
        await _db.DeckCards.AddAsync(card, cancellationToken);
    }

    public async Task AddPurchaseAsync(DeckPurchase purchase, CancellationToken cancellationToken = default)
    {
        await _db.DeckPurchases.AddAsync(purchase, cancellationToken);
    }

    public void UpdateDeck(Deck deck)
    {
        _db.Decks.Update(deck);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
