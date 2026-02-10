
using Education.Domain.Entities;
namespace Education.Domain.Interfaces;


public interface ITodoRepository
{
    Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(TodoItem item, CancellationToken cancellationToken = default);
    void Update(TodoItem item);
    void Remove(TodoItem item);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
