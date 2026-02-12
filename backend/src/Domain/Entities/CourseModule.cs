namespace Education.Domain.Entities;

public sealed class CourseModule : AuditableEntity
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public ICollection<CourseLesson> Lessons { get; set; } = new List<CourseLesson>();
}
