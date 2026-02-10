namespace Education.Infrastructure.Events;

using Education.Application.Abstractions;
using Education.Domain.Events;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

public sealed class DomainEventDispatcher : IDomainEventDispatcher
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DomainEventDispatcher> _logger;

    public DomainEventDispatcher(IServiceProvider serviceProvider, ILogger<DomainEventDispatcher> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task DispatchAsync(IReadOnlyCollection<IDomainEvent> domainEvents, CancellationToken cancellationToken = default)
    {
        foreach (var domainEvent in domainEvents)
        {
            var eventType = domainEvent.GetType();
            var handlerType = typeof(IDomainEventHandler<>).MakeGenericType(eventType);
            var handlers = _serviceProvider.GetServices(handlerType);

            if (!handlers.Any())
            {
                _logger.LogDebug("No handlers registered for domain event {EventType}", eventType.Name);
                continue;
            }

            foreach (var handler in handlers)
            {
                var handleMethod = handlerType.GetMethod("HandleAsync");
                if (handleMethod is null)
                {
                    continue;
                }

                var task = handleMethod.Invoke(handler, new object?[] { domainEvent, cancellationToken }) as Task;
                if (task is not null)
                {
                    await task.ConfigureAwait(false);
                }
            }
        }
    }
}
