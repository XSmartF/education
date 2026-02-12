namespace Education.Domain.Entities;

public sealed class DeckCard : AuditableEntity
{
    public Guid DeckId { get; set; }
    public Deck Deck { get; set; } = null!;
    public string FrontText { get; set; } = string.Empty;
    public string BackText { get; set; } = string.Empty;
    public int Difficulty { get; set; } = 1;
    public DateTimeOffset? NextReviewAt { get; set; }
}
