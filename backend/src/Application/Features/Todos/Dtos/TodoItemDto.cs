namespace Education.Application.Features.Todos.Dtos;


public sealed record TodoItemDto(Guid Id, string Title, bool IsDone, DateTimeOffset CreatedAt);

public sealed record CreateTodoRequest([property: Required, MaxLength(200)] string Title);

public sealed record UpdateTodoRequest([property: Required, MaxLength(200)] string Title, bool IsDone);

public sealed record PatchTodoRequest([property: MaxLength(200)] string? Title, bool? IsDone);
