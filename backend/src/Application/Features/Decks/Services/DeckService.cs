namespace Education.Application.Features.Decks.Services;

using Education.Application.Features.Decks.Abstractions;
using Education.Application.Features.Decks.Dtos;
using Education.Domain.Entities;
using Education.Domain.Interfaces;

public sealed class DeckService : IDeckService
{
    private readonly IDeckRepository _repository;

    public DeckService(IDeckRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<DeckItemDto>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetPublishedAsync(cancellationToken);
        return items.Select(MapItem).ToList();
    }

    public async Task<IReadOnlyList<DeckItemDto>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetByOwnerAsync(ownerId, cancellationToken);
        return items.Select(MapItem).ToList();
    }

    public async Task<DeckDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deck = await _repository.GetByIdAsync(id, includeDetails: true, cancellationToken);
        return deck is null ? null : MapDetail(deck);
    }

    public async Task<DeckDetailDto> CreateAsync(Guid ownerId, CreateDeckRequest request, CancellationToken cancellationToken = default)
    {
        var visibility = NormalizeVisibility(request.Visibility);
        var deck = new Deck
        {
            Id = Guid.NewGuid(),
            OwnerId = ownerId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Visibility = visibility,
            Price = visibility == "public_paid" ? request.Price : 0m,
            IsPublished = false,
            LikeCount = 0,
            RatingAverage = 0m,
            PurchaseCount = 0,
        };

        await _repository.AddDeckAsync(deck, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapDetail(deck);
    }

    public async Task<DeckDetailDto?> UpdateAsync(
        Guid ownerId,
        Guid id,
        UpdateDeckRequest request,
        CancellationToken cancellationToken = default)
    {
        var deck = await _repository.GetByIdAsync(id, includeDetails: true, cancellationToken);
        if (deck is null || deck.OwnerId != ownerId)
        {
            return null;
        }

        var visibility = NormalizeVisibility(request.Visibility);
        deck.Title = request.Title.Trim();
        deck.Description = request.Description.Trim();
        deck.Visibility = visibility;
        deck.Price = visibility == "public_paid" ? request.Price : 0m;

        _repository.UpdateDeck(deck);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapDetail(deck);
    }

    public async Task<DeckCardDto?> AddCardAsync(
        Guid ownerId,
        Guid deckId,
        CreateDeckCardRequest request,
        CancellationToken cancellationToken = default)
    {
        var deck = await _repository.GetByIdAsync(deckId, cancellationToken: cancellationToken);
        if (deck is null || deck.OwnerId != ownerId)
        {
            return null;
        }

        var card = new DeckCard
        {
            Id = Guid.NewGuid(),
            DeckId = deckId,
            FrontText = request.FrontText.Trim(),
            BackText = request.BackText.Trim(),
            Difficulty = request.Difficulty,
            NextReviewAt = DateTimeOffset.UtcNow.AddDays(1)
        };

        await _repository.AddCardAsync(card, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapCard(card);
    }

    public async Task<bool> PublishAsync(Guid ownerId, Guid deckId, CancellationToken cancellationToken = default)
    {
        var deck = await _repository.GetByIdAsync(deckId, cancellationToken: cancellationToken);
        if (deck is null || deck.OwnerId != ownerId)
        {
            return false;
        }

        deck.IsPublished = true;
        _repository.UpdateDeck(deck);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static string NormalizeVisibility(string value)
    {
        var normalized = value.Trim().ToLowerInvariant();
        return normalized switch
        {
            "private" => "private",
            "public_paid" => "public_paid",
            _ => "public_free",
        };
    }

    private static DeckItemDto MapItem(Deck deck)
    {
        return new DeckItemDto(
            deck.Id,
            deck.OwnerId,
            deck.Title,
            deck.Description,
            deck.Visibility,
            deck.Price,
            deck.IsPublished,
            deck.Cards.Count,
            deck.PurchaseCount,
            deck.RatingAverage);
    }

    private static DeckDetailDto MapDetail(Deck deck)
    {
        return new DeckDetailDto(
            deck.Id,
            deck.OwnerId,
            deck.Title,
            deck.Description,
            deck.Visibility,
            deck.Price,
            deck.IsPublished,
            deck.PurchaseCount,
            deck.RatingAverage,
            deck.Cards.OrderBy(x => x.CreatedAt).Select(MapCard).ToList());
    }

    private static DeckCardDto MapCard(DeckCard card)
    {
        return new DeckCardDto(card.Id, card.FrontText, card.BackText, card.Difficulty, card.NextReviewAt);
    }
}
