namespace Education.Application.Features.Todos.Abstractions;


public interface ITodoService
{
    Task<IReadOnlyList<TodoItemDto>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<TodoItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<TodoItemDto> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken cancellationToken = default);
    Task<bool> PatchAsync(Guid id, PatchTodoRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
