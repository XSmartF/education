namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class TodoRepository : ITodoRepository
{
    private readonly AppDbContext _db;

    public TodoRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TodoItem>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.TodoItems.AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<TodoItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return _db.TodoItems.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task AddAsync(TodoItem item, CancellationToken cancellationToken = default)
    {
        await _db.TodoItems.AddAsync(item, cancellationToken);
    }

    public void Update(TodoItem item)
    {
        _db.TodoItems.Update(item);
    }

    public void Remove(TodoItem item)
    {
        _db.TodoItems.Remove(item);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
