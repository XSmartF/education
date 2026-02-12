namespace Education.Domain.Entities;

public sealed class Deck : AuditableEntity
{
    public Guid OwnerId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Visibility { get; set; } = "private";
    public decimal Price { get; set; }
    public bool IsPublished { get; set; }
    public int LikeCount { get; set; }
    public decimal RatingAverage { get; set; }
    public int PurchaseCount { get; set; }
    public ICollection<DeckCard> Cards { get; set; } = new List<DeckCard>();
    public ICollection<DeckPurchase> Purchases { get; set; } = new List<DeckPurchase>();
}
