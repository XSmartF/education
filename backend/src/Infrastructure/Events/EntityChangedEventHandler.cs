namespace Education.Infrastructure.Events;

using Education.Application.Abstractions;
using Education.Domain.Events;
using Microsoft.Extensions.Logging;

public sealed class EntityChangedEventHandler : IDomainEventHandler<EntityChangedEvent>
{
    private readonly ILogger<EntityChangedEventHandler> _logger;

    public EntityChangedEventHandler(ILogger<EntityChangedEventHandler> logger)
    {
        _logger = logger;
    }

    public Task HandleAsync(EntityChangedEvent domainEvent, CancellationToken cancellationToken = default)
    {
        _logger.LogDebug(
            "Entity {EntityType} {ChangeType} (Id: {EntityId}) by {UserId}",
            domainEvent.Entity.GetType().Name,
            domainEvent.ChangeType,
            domainEvent.Entity.Id,
            domainEvent.UserId ?? "system");

        return Task.CompletedTask;
    }
}
