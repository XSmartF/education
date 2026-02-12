namespace Education.Application.Features.Courses.Dtos;

using System.ComponentModel.DataAnnotations;

public sealed record CourseLessonDto(
    Guid Id,
    string Title,
    string ContentType,
    string? ContentUrl,
    int DurationMinutes,
    int SortOrder);

public sealed record CourseModuleDto(
    Guid Id,
    string Title,
    int SortOrder,
    IReadOnlyList<CourseLessonDto> Lessons);

public sealed record CourseItemDto(
    Guid Id,
    Guid TeacherId,
    string Title,
    string Description,
    string Category,
    string Level,
    decimal Price,
    bool IsPublic,
    bool IsPublished,
    int ModuleCount,
    int EnrollmentCount);

public sealed record CourseDetailDto(
    Guid Id,
    Guid TeacherId,
    string Title,
    string Description,
    string Category,
    string Level,
    decimal Price,
    bool IsPublic,
    bool IsPublished,
    int EnrollmentCount,
    IReadOnlyList<CourseModuleDto> Modules);

public sealed record CreateCourseRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Required][MaxLength(100)] string Category,
    [Required][MaxLength(80)] string Level,
    [Range(0, 100000000)] decimal Price,
    bool IsPublic);

public sealed record UpdateCourseRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Required][MaxLength(100)] string Category,
    [Required][MaxLength(80)] string Level,
    [Range(0, 100000000)] decimal Price,
    bool IsPublic);

public sealed record CreateCourseModuleRequest(
    [Required][MaxLength(200)] string Title,
    [Range(0, 10000)] int SortOrder);

public sealed record CreateCourseLessonRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(80)] string ContentType,
    [MaxLength(1000)] string? ContentUrl,
    [Range(0, 10000)] int DurationMinutes,
    [Range(0, 10000)] int SortOrder);
