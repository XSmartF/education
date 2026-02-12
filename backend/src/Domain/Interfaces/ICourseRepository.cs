using Education.Domain.Entities;

namespace Education.Domain.Interfaces;

public interface ICourseRepository
{
    Task<IReadOnlyList<Course>> GetPublishedAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Course>> GetByTeacherAsync(Guid teacherId, CancellationToken cancellationToken = default);
    Task<Course?> GetByIdAsync(Guid id, bool includeDetails = false, CancellationToken cancellationToken = default);
    Task<CourseModule?> GetModuleByIdAsync(Guid moduleId, CancellationToken cancellationToken = default);
    Task<CourseEnrollment?> GetEnrollmentAsync(Guid courseId, Guid studentId, CancellationToken cancellationToken = default);
    Task AddCourseAsync(Course course, CancellationToken cancellationToken = default);
    Task AddModuleAsync(CourseModule module, CancellationToken cancellationToken = default);
    Task AddLessonAsync(CourseLesson lesson, CancellationToken cancellationToken = default);
    Task AddEnrollmentAsync(CourseEnrollment enrollment, CancellationToken cancellationToken = default);
    void UpdateCourse(Course course);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
