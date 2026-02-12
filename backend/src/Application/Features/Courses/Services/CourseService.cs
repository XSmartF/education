namespace Education.Application.Features.Courses.Services;

using Education.Application.Features.Courses.Abstractions;
using Education.Application.Features.Courses.Dtos;
using Education.Domain.Entities;
using Education.Domain.Interfaces;

public sealed class CourseService : ICourseService
{
    private readonly ICourseRepository _repository;

    public CourseService(ICourseRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<CourseItemDto>> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        var courses = await _repository.GetPublishedAsync(cancellationToken);
        return courses.Select(MapCourseItem).ToList();
    }

    public async Task<IReadOnlyList<CourseItemDto>> GetByTeacherAsync(Guid teacherId, CancellationToken cancellationToken = default)
    {
        var courses = await _repository.GetByTeacherAsync(teacherId, cancellationToken);
        return courses.Select(MapCourseItem).ToList();
    }

    public async Task<CourseDetailDto?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(id, includeDetails: true, cancellationToken);
        return course is null ? null : MapCourseDetail(course);
    }

    public async Task<CourseDetailDto> CreateAsync(Guid teacherId, CreateCourseRequest request, CancellationToken cancellationToken = default)
    {
        var course = new Course
        {
            Id = Guid.NewGuid(),
            TeacherId = teacherId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            Level = request.Level.Trim(),
            Price = request.Price,
            IsPublic = request.IsPublic,
            IsPublished = false,
        };

        await _repository.AddCourseAsync(course, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapCourseDetail(course);
    }

    public async Task<CourseDetailDto?> UpdateAsync(
        Guid teacherId,
        Guid id,
        UpdateCourseRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(id, includeDetails: true, cancellationToken);
        if (course is null || course.TeacherId != teacherId)
        {
            return null;
        }

        course.Title = request.Title.Trim();
        course.Description = request.Description.Trim();
        course.Category = request.Category.Trim();
        course.Level = request.Level.Trim();
        course.Price = request.Price;
        course.IsPublic = request.IsPublic;

        _repository.UpdateCourse(course);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapCourseDetail(course);
    }

    public async Task<CourseModuleDto?> AddModuleAsync(
        Guid teacherId,
        Guid courseId,
        CreateCourseModuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(courseId, cancellationToken: cancellationToken);
        if (course is null || course.TeacherId != teacherId)
        {
            return null;
        }

        var module = new CourseModule
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            Title = request.Title.Trim(),
            SortOrder = request.SortOrder,
        };

        await _repository.AddModuleAsync(module, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapModule(module);
    }

    public async Task<CourseLessonDto?> AddLessonAsync(
        Guid teacherId,
        Guid courseId,
        Guid moduleId,
        CreateCourseLessonRequest request,
        CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(courseId, cancellationToken: cancellationToken);
        if (course is null || course.TeacherId != teacherId)
        {
            return null;
        }

        var module = await _repository.GetModuleByIdAsync(moduleId, cancellationToken);
        if (module is null || module.CourseId != courseId)
        {
            return null;
        }

        var lesson = new CourseLesson
        {
            Id = Guid.NewGuid(),
            CourseModuleId = moduleId,
            Title = request.Title.Trim(),
            ContentType = request.ContentType.Trim(),
            ContentUrl = string.IsNullOrWhiteSpace(request.ContentUrl) ? null : request.ContentUrl.Trim(),
            DurationMinutes = request.DurationMinutes,
            SortOrder = request.SortOrder,
        };

        await _repository.AddLessonAsync(lesson, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return MapLesson(lesson);
    }

    public async Task<bool> PublishAsync(Guid teacherId, Guid courseId, CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(courseId, cancellationToken: cancellationToken);
        if (course is null || course.TeacherId != teacherId)
        {
            return false;
        }

        course.IsPublished = true;
        _repository.UpdateCourse(course);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> EnrollAsync(Guid studentId, Guid courseId, CancellationToken cancellationToken = default)
    {
        var course = await _repository.GetByIdAsync(courseId, cancellationToken: cancellationToken);
        if (course is null || !course.IsPublished || !course.IsPublic)
        {
            return false;
        }

        var exists = await _repository.GetEnrollmentAsync(courseId, studentId, cancellationToken);
        if (exists is not null)
        {
            return true;
        }

        var enrollment = new CourseEnrollment
        {
            Id = Guid.NewGuid(),
            CourseId = courseId,
            StudentId = studentId,
            CompletionRate = 0m,
            IsCompleted = false,
        };

        await _repository.AddEnrollmentAsync(enrollment, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CourseItemDto MapCourseItem(Course course)
    {
        return new CourseItemDto(
            course.Id,
            course.TeacherId,
            course.Title,
            course.Description,
            course.Category,
            course.Level,
            course.Price,
            course.IsPublic,
            course.IsPublished,
            course.Modules.Count,
            course.Enrollments.Count);
    }

    private static CourseDetailDto MapCourseDetail(Course course)
    {
        var modules = course.Modules
            .OrderBy(x => x.SortOrder)
            .Select(module => new CourseModuleDto(
                module.Id,
                module.Title,
                module.SortOrder,
                module.Lessons.OrderBy(x => x.SortOrder).Select(MapLesson).ToList()))
            .ToList();

        return new CourseDetailDto(
            course.Id,
            course.TeacherId,
            course.Title,
            course.Description,
            course.Category,
            course.Level,
            course.Price,
            course.IsPublic,
            course.IsPublished,
            course.Enrollments.Count,
            modules);
    }

    private static CourseModuleDto MapModule(CourseModule module)
    {
        return new CourseModuleDto(module.Id, module.Title, module.SortOrder, Array.Empty<CourseLessonDto>());
    }

    private static CourseLessonDto MapLesson(CourseLesson lesson)
    {
        return new CourseLessonDto(
            lesson.Id,
            lesson.Title,
            lesson.ContentType,
            lesson.ContentUrl,
            lesson.DurationMinutes,
            lesson.SortOrder);
    }
}
