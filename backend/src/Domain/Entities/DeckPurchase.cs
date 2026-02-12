namespace Education.Domain.Entities;

public sealed class DeckPurchase : AuditableEntity
{
    public Guid DeckId { get; set; }
    public Deck Deck { get; set; } = null!;
    public Guid BuyerId { get; set; }
    public decimal Price { get; set; }
}
