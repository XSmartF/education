using System.ComponentModel.DataAnnotations;
using Education.Api.Contracts;
using Education.Api.Resources;
using Microsoft.Extensions.Localization;

namespace Education.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;
    private readonly IStringLocalizer<SharedResource> _localizer;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment,
        IStringLocalizer<SharedResource> localizer)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _localizer = localizer;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteProblemDetailsAsync(context, ex);
        }
    }

    private async Task WriteProblemDetailsAsync(HttpContext context, Exception exception)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        var statusCode = MapStatusCode(exception);
        var message = _environment.IsDevelopment() || statusCode < StatusCodes.Status500InternalServerError
            ? exception.Message
            : _localizer["Error_Generic"].Value;

        var response = ApiResponse.Fail(
            MapErrorCode(exception),
            message,
            traceId: context.TraceIdentifier);

        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsJsonAsync(response);
    }

    private static int MapStatusCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            ArgumentException => StatusCodes.Status400BadRequest,
            KeyNotFoundException => StatusCodes.Status404NotFound,
            UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
            _ => StatusCodes.Status500InternalServerError
        };
    }

    private static string MapErrorCode(Exception exception)
    {
        return exception switch
        {
            ValidationException => ApiErrorCodes.ValidationError,
            ArgumentException => ApiErrorCodes.BadRequest,
            KeyNotFoundException => ApiErrorCodes.NotFound,
            UnauthorizedAccessException => ApiErrorCodes.Unauthorized,
            _ => ApiErrorCodes.ServerError
        };
    }
}
