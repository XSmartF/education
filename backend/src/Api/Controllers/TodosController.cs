using Education.Api.Contracts;
using Education.Api.Authorization;
using Education.Application.Features.Todos.Abstractions;
using Education.Application.Features.Todos.Dtos;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace Education.Api.Controllers;

[ApiController]
[EnableRateLimiting("global")]
[Authorize(Policy = ApiPolicies.AppAccess)]
[Route("api/[controller]")]
public sealed class TodosController : ControllerBase
{
    private const string StaffRoles =
        RoleNames.Admin + "," + RoleNames.Teacher + "," + RoleNames.Organize;
    private readonly ITodoService _service;

    public TodosController(ITodoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<TodoItemDto>>>> GetAll(CancellationToken cancellationToken)
    {
        var items = await _service.GetAllAsync(cancellationToken);
        return Ok(ApiResponse.Ok(items));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<TodoItemDto>>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var item = await _service.GetByIdAsync(id, cancellationToken);
        if (item is null)
        {
            return NotFound(ApiResponse.Fail<TodoItemDto>(ApiErrorCodes.NotFound, "Todo not found."));
        }

        return Ok(ApiResponse.Ok(item));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<TodoItemDto>>> Create(CreateTodoRequest request, CancellationToken cancellationToken)
    {
        var created = await _service.CreateAsync(request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, ApiResponse.Ok(created));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object?>>> Update(Guid id, UpdateTodoRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.UpdateAsync(id, request, cancellationToken);
        return updated
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Todo not found."));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpPatch("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object?>>> Patch(Guid id, PatchTodoRequest request, CancellationToken cancellationToken)
    {
        var updated = await _service.PatchAsync(id, request, cancellationToken);
        return updated
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Todo not found."));
    }

    [Authorize(Roles = StaffRoles)]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<object?>>> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await _service.DeleteAsync(id, cancellationToken);
        return deleted
            ? Ok(ApiResponse.Ok())
            : NotFound(ApiResponse.Fail(ApiErrorCodes.NotFound, "Todo not found."));
    }
}
