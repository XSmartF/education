using System.ComponentModel.DataAnnotations;
using Education.Api.Contracts;
using Education.Api.Options;
using Education.Api.Resources;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Options;

namespace Education.Api.Middleware;

public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;
    private readonly IStringLocalizer<SharedResource> _localizer;
    private readonly DiagnosticsOptions _diagnosticsOptions;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment,
        IStringLocalizer<SharedResource> localizer,
        IOptions<DiagnosticsOptions> diagnosticsOptions)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
        _localizer = localizer;
        _diagnosticsOptions = diagnosticsOptions.Value;
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
        var showDetails = _environment.IsDevelopment()
                          || statusCode < StatusCodes.Status500InternalServerError
                          || _diagnosticsOptions.IncludeExceptionDetails;

        var message = showDetails ? exception.Message : _localizer["Error_Generic"].Value;
        IReadOnlyDictionary<string, string[]>? errors = null;

        if (_diagnosticsOptions.IncludeExceptionDetails &&
            statusCode >= StatusCodes.Status500InternalServerError)
        {
            var details = new Dictionary<string, string[]>
            {
                ["exception"] = new[]
                {
                    exception.GetType().FullName ?? "Exception",
                    exception.Message
                }
            };

            if (exception.InnerException is not null)
            {
                details["inner"] = new[]
                {
                    exception.InnerException.GetType().FullName ?? "Exception",
                    exception.InnerException.Message
                };
            }

            errors = details;
        }

        var response = ApiResponse.Fail(
            MapErrorCode(exception),
            message,
            errors,
            context.TraceIdentifier);

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
