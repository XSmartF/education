namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class CourseRepository : ICourseRepository
{
    private readonly AppDbContext _db;

    public CourseRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<Course>> GetPublishedAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Courses.AsNoTracking()
            .Where(x => x.IsPublished && x.IsPublic)
            .Include(x => x.Modules)
            .Include(x => x.Enrollments)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Course>> GetByTeacherAsync(Guid teacherId, CancellationToken cancellationToken = default)
    {
        return await _db.Courses.AsNoTracking()
            .Where(x => x.TeacherId == teacherId)
            .Include(x => x.Modules)
            .Include(x => x.Enrollments)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Course?> GetByIdAsync(
        Guid id,
        bool includeDetails = false,
        CancellationToken cancellationToken = default)
    {
        IQueryable<Course> query = _db.Courses;
        if (includeDetails)
        {
            query = query
                .Include(x => x.Modules)
                .ThenInclude(x => x.Lessons)
                .Include(x => x.Enrollments);
        }

        return query.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<CourseModule?> GetModuleByIdAsync(Guid moduleId, CancellationToken cancellationToken = default)
    {
        return _db.CourseModules.FirstOrDefaultAsync(x => x.Id == moduleId, cancellationToken);
    }

    public Task<CourseEnrollment?> GetEnrollmentAsync(Guid courseId, Guid studentId, CancellationToken cancellationToken = default)
    {
        return _db.CourseEnrollments.FirstOrDefaultAsync(
            x => x.CourseId == courseId && x.StudentId == studentId,
            cancellationToken);
    }

    public async Task AddCourseAsync(Course course, CancellationToken cancellationToken = default)
    {
        await _db.Courses.AddAsync(course, cancellationToken);
    }

    public async Task AddModuleAsync(CourseModule module, CancellationToken cancellationToken = default)
    {
        await _db.CourseModules.AddAsync(module, cancellationToken);
    }

    public async Task AddLessonAsync(CourseLesson lesson, CancellationToken cancellationToken = default)
    {
        await _db.CourseLessons.AddAsync(lesson, cancellationToken);
    }

    public async Task AddEnrollmentAsync(CourseEnrollment enrollment, CancellationToken cancellationToken = default)
    {
        await _db.CourseEnrollments.AddAsync(enrollment, cancellationToken);
    }

    public void UpdateCourse(Course course)
    {
        _db.Courses.Update(course);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
