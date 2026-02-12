namespace Education.Application.Features.Decks.Abstractions;

using Education.Application.Features.Decks.Dtos;

public interface IDeckService
{
    Task<IReadOnlyList<DeckItemDto>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<DeckItemDto>> GetByOwnerAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task<DeckDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<DeckDetailDto> CreateAsync(Guid ownerId, CreateDeckRequest request, CancellationToken cancellationToken = default);
    Task<DeckDetailDto?> UpdateAsync(Guid ownerId, Guid id, UpdateDeckRequest request, CancellationToken cancellationToken = default);
    Task<DeckCardDto?> AddCardAsync(Guid ownerId, Guid deckId, CreateDeckCardRequest request, CancellationToken cancellationToken = default);
    Task<bool> PublishAsync(Guid ownerId, Guid deckId, CancellationToken cancellationToken = default);
}
