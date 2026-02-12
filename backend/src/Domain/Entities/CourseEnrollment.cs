namespace Education.Domain.Entities;

public sealed class CourseEnrollment : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public Guid StudentId { get; set; }
    public decimal CompletionRate { get; set; }
    public bool IsCompleted { get; set; }
}
