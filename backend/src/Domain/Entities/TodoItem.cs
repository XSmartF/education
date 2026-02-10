namespace Education.Domain.Entities;

public sealed class TodoItem : AuditableEntity
{
    public string Title { get; set; } = string.Empty;
    public bool IsDone { get; set; }
}