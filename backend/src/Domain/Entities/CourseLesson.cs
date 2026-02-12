namespace Education.Domain.Entities;

public sealed class CourseLesson : AuditableEntity
{
    public Guid CourseModuleId { get; set; }
    public CourseModule CourseModule { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string ContentType { get; set; } = "video";
    public string? ContentUrl { get; set; }
    public int DurationMinutes { get; set; }
    public int SortOrder { get; set; }
}
