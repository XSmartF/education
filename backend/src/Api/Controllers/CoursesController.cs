using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Application.Abstractions;
using Education.Application.Features.Courses.Abstractions;
using Education.Application.Features.Courses.Dtos;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
public sealed class CoursesController : ControllerBase
{
    private const string StaffRoles = RoleNames.Admin + "," + RoleNames.Teacher + "," + RoleNames.Organize;
    private readonly ICourseService _service;
    private readonly ICurrentUser _currentUser;

    public CoursesController(ICourseService service, ICurrentUser currentUser)
    {
        _service = service;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CourseItemDto>>>> GetCatalog(CancellationToken cancellationToken)
    {
        var items = await _service.GetCatalogAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpGet("me")]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<CourseItemDto>>>> GetMyCourses(CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(ApiResponse.Fail<IReadOnlyList<CourseItemDto>>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var items = await _service.GetByTeacherAsync(userId, cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CourseDetailDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound(ApiResponse.Fail<CourseDetailDto>(ApiErrorCodes.NotFound, "Course not found."));
        }

        return Ok(ApiResponse.Ok(item));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CourseDetailDto>>> Create(
        [FromBody] CreateCourseRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var teacherId))
        {
            return Unauthorized(ApiResponse.Fail<CourseDetailDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var created = await _service.CreateAsync(teacherId, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse.Ok(created));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<CourseDetailDto>>> Update(
        Guid id,
        [FromBody] UpdateCourseRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var teacherId))
        {
            return Unauthorized(ApiResponse.Fail<CourseDetailDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var updated = await _service.UpdateAsync(teacherId, id, request, cancellationToken);
        if (updated is null)
        {
            return NotFound(ApiResponse.Fail<CourseDetailDto>(ApiErrorCodes.NotFound, "Course not found."));
        }

        return Ok(ApiResponse.Ok(updated));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost("{id:guid}/modules")]
    public async Task<ActionResult<ApiResponse<CourseModuleDto>>> AddModule(
        Guid id,
        [FromBody] CreateCourseModuleRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var teacherId))
        {
            return Unauthorized(ApiResponse.Fail<CourseModuleDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var added = await _service.AddModuleAsync(teacherId, id, request, cancellationToken);
        if (added is null)
        {
            return NotFound(ApiResponse.Fail<CourseModuleDto>(ApiErrorCodes.NotFound, "Course not found."));
        }

        return Ok(ApiResponse.Ok(added));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost("{id:guid}/modules/{moduleId:guid}/lessons")]
    public async Task<ActionResult<ApiResponse<CourseLessonDto>>> AddLesson(
        Guid id,
        Guid moduleId,
        [FromBody] CreateCourseLessonRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var teacherId))
        {
            return Unauthorized(ApiResponse.Fail<CourseLessonDto>(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var added = await _service.AddLessonAsync(teacherId, id, moduleId, request, cancellationToken);
        if (added is null)
        {
            return NotFound(ApiResponse.Fail<CourseLessonDto>(ApiErrorCodes.NotFound, "Course/module not found."));
        }

        return Ok(ApiResponse.Ok(added));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost("{id:guid}/publish")]
    public async Task<ActionResult<ApiResponse<object?>>> Publish(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var teacherId))
        {
            return Unauthorized(ApiResponse.Fail(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var ok = await _service.PublishAsync(teacherId, id, cancellationToken);
        return ok
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Course not found."));
    }

    [HttpPost("{id:guid}/enroll")]
    public async Task<ActionResult<ApiResponse<object?>>> Enroll(Guid id, CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var studentId))
        {
            return Unauthorized(ApiResponse.Fail(ApiErrorCodes.Unauthorized, "Unauthorized."));
        }

        var ok = await _service.EnrollAsync(studentId, id, cancellationToken);
        return ok
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Course not found."));
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        return Guid.TryParse(_currentUser.UserId, out userId);
    }
}
