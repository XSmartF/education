
using Education.Domain.Interfaces;
namespace Education.Application.Features.Todos.Services;

using AutoMapper;
using Education.Application.Features.Todos.Abstractions;
using Education.Application.Features.Todos.Dtos;
using Education.Domain.Entities;

public sealed class TodoService : ITodoService
{
    private readonly ITodoRepository _repository;
    private readonly IMapper _mapper;

    public TodoService(ITodoRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IReadOnlyList<TodoItemDto>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var items = await _repository.GetAllAsync(cancellationToken);
        return items.Select(item => _mapper.Map<TodoItemDto>(item)).ToList();
    }

    public async Task<TodoItemDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        return item is null ? null : _mapper.Map<TodoItemDto>(item);
    }

    public async Task<TodoItemDto> CreateAsync(CreateTodoRequest request, CancellationToken cancellationToken = default)
    {
        var item = new TodoItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            IsDone = false
        };

        await _repository.AddAsync(item, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return _mapper.Map<TodoItemDto>(item);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateTodoRequest request, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return false;
        }

        item.Title = request.Title.Trim();
        item.IsDone = request.IsDone;

        _repository.Update(item);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> PatchAsync(Guid id, PatchTodoRequest request, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return false;
        }

        if (request.Title is not null)
        {
            item.Title = request.Title.Trim();
        }

        if (request.IsDone.HasValue)
        {
            item.IsDone = request.IsDone.Value;
        }

        _repository.Update(item);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var item = await _repository.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return false;
        }

        _repository.Remove(item);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

}
