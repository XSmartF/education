namespace Education.Infrastructure.Data;

public sealed class OutboxMessage
{
    public Guid Id { get; set; }
    public DateTimeOffset OccurredOn { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Payload { get; set; } = string.Empty;
    public DateTimeOffset? ProcessedAt { get; set; }
}
