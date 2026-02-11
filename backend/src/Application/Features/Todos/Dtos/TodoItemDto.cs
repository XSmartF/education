
using System.ComponentModel.DataAnnotations;
namespace Education.Application.Features.Todos.Dtos;

public sealed record TodoItemDto(Guid Id, string Title, bool IsDone, DateTimeOffset CreatedAt);
public sealed record CreateTodoRequest([Required][MaxLength(200)] string Title);
public sealed record UpdateTodoRequest([Required][MaxLength(200)] string Title, bool IsDone);
public sealed record PatchTodoRequest([MaxLength(200)] string? Title, bool? IsDone);
