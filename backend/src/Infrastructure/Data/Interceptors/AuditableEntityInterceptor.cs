namespace Education.Infrastructure.Data.Interceptors;

using System.Text.Json;
using Education.Application.Abstractions;
using Education.Domain.Entities;
using Education.Domain.Events;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;

public sealed class AuditableEntityInterceptor : SaveChangesInterceptor
{
    private readonly ICurrentUser _currentUser;
    private readonly IDomainEventDispatcher _dispatcher;
    private readonly ILogger<AuditableEntityInterceptor> _logger;

    public AuditableEntityInterceptor(
        ICurrentUser currentUser,
        IDomainEventDispatcher dispatcher,
        ILogger<AuditableEntityInterceptor> logger)
    {
        _currentUser = currentUser;
        _dispatcher = dispatcher;
        _logger = logger;
    }

    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        if (eventData.Context is not null)
        {
            ApplyAuditAndEvents(eventData.Context);
        }

        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            ApplyAuditAndEvents(eventData.Context);
        }

        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    public override int SavedChanges(SaveChangesCompletedEventData eventData, int result)
    {
        if (eventData.Context is not null)
        {
            DispatchDomainEventsAsync(eventData.Context, CancellationToken.None).GetAwaiter().GetResult();
        }

        return base.SavedChanges(eventData, result);
    }

    public override async ValueTask<int> SavedChangesAsync(
        SaveChangesCompletedEventData eventData,
        int result,
        CancellationToken cancellationToken = default)
    {
        if (eventData.Context is not null)
        {
            await DispatchDomainEventsAsync(eventData.Context, cancellationToken).ConfigureAwait(false);
        }

        return await base.SavedChangesAsync(eventData, result, cancellationToken).ConfigureAwait(false);
    }

    private void ApplyAuditAndEvents(DbContext context)
    {
        var now = DateTimeOffset.UtcNow;
        var userId = _currentUser.UserId;

        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            var state = entry.State;

            if (entry.Entity is AuditableEntity auditable)
            {
                if (state == EntityState.Added)
                {
                    auditable.CreatedAt = now;
                    auditable.CreatedBy ??= userId;
                    auditable.IsDeleted = false;
                }
                else if (state == EntityState.Modified)
                {
                    auditable.UpdatedAt = now;
                    auditable.UpdatedBy = userId;
                }
                else if (state == EntityState.Deleted)
                {
                    auditable.IsDeleted = true;
                    auditable.DeletedAt = now;
                    auditable.DeletedBy = userId;
                    auditable.UpdatedAt = now;
                    auditable.UpdatedBy = userId;
                    entry.State = EntityState.Modified;
                }
            }

            if (state == EntityState.Added)
            {
                entry.Entity.AddDomainEvent(
                    new EntityChangedEvent(entry.Entity, EntityChangeType.Created, now, userId));
            }
            else if (state == EntityState.Modified)
            {
                entry.Entity.AddDomainEvent(
                    new EntityChangedEvent(entry.Entity, EntityChangeType.Updated, now, userId));
            }
            else if (state == EntityState.Deleted)
            {
                entry.Entity.AddDomainEvent(
                    new EntityChangedEvent(entry.Entity, EntityChangeType.Deleted, now, userId));
            }
        }

        AddOutboxMessages(context);
    }

    private static void AddOutboxMessages(DbContext context)
    {
        var domainEvents = context.ChangeTracker
            .Entries<BaseEntity>()
            .SelectMany(entry => entry.Entity.DomainEvents)
            .ToList();

        if (domainEvents.Count == 0)
        {
            return;
        }

        var outboxMessages = domainEvents.Select(CreateOutboxMessage).ToList();
        context.Set<OutboxMessage>().AddRange(outboxMessages);
    }

    private static OutboxMessage CreateOutboxMessage(IDomainEvent domainEvent)
    {
        object payload = domainEvent switch
        {
            EntityChangedEvent changed => new
            {
                changed.Entity.Id,
                EntityType = changed.Entity.GetType().Name,
                ChangeType = changed.ChangeType.ToString(),
                changed.UserId,
                changed.OccurredOn
            },
            _ => new
            {
                EventType = domainEvent.GetType().Name,
                domainEvent.OccurredOn
            }
        };

        return new OutboxMessage
        {
            Id = Guid.NewGuid(),
            OccurredOn = domainEvent.OccurredOn,
            Type = domainEvent.GetType().Name,
            Payload = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            })
        };
    }

    private async Task DispatchDomainEventsAsync(DbContext context, CancellationToken cancellationToken)
    {
        var domainEvents = context.ChangeTracker
            .Entries<BaseEntity>()
            .SelectMany(entry => entry.Entity.DomainEvents)
            .ToList();

        if (domainEvents.Count == 0)
        {
            return;
        }

        foreach (var entry in context.ChangeTracker.Entries<BaseEntity>())
        {
            entry.Entity.ClearDomainEvents();
        }

        try
        {
            await _dispatcher.DispatchAsync(domainEvents, cancellationToken).ConfigureAwait(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error dispatching domain events");
            throw;
        }
    }
}
