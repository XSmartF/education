namespace Education.Application.Features.Courses.Abstractions;

using Education.Application.Features.Courses.Dtos;

public interface ICourseService
{
    Task<IReadOnlyList<CourseItemDto>> GetCatalogAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CourseItemDto>> GetByTeacherAsync(Guid teacherId, CancellationToken cancellationToken = default);
    Task<CourseDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CourseDetailDto> CreateAsync(Guid teacherId, CreateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseDetailDto?> UpdateAsync(Guid teacherId, Guid id, UpdateCourseRequest request, CancellationToken cancellationToken = default);
    Task<CourseModuleDto?> AddModuleAsync(Guid teacherId, Guid courseId, CreateCourseModuleRequest request, CancellationToken cancellationToken = default);
    Task<CourseLessonDto?> AddLessonAsync(Guid teacherId, Guid courseId, Guid moduleId, CreateCourseLessonRequest request, CancellationToken cancellationToken = default);
    Task<bool> PublishAsync(Guid teacherId, Guid courseId, CancellationToken cancellationToken = default);
    Task<bool> EnrollAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default);
}
