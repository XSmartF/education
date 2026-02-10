namespace Education.Domain.Events;

using Education.Domain.Entities;

public sealed record EntityChangedEvent(
    BaseEntity Entity,
    EntityChangeType ChangeType,
    DateTimeOffset OccurredOn,
    string? UserId) : IDomainEvent;
