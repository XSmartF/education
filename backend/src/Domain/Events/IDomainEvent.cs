namespace Education.Domain.Events;

public interface IDomainEvent
{
    DateTimeOffset OccurredOn { get; }
}
