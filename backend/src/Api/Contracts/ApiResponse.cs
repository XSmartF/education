namespace Education.Api.Contracts;

public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    ApiError? Error,
    string? TraceId)
{
    public static ApiResponse<T> Ok(T data) => new(true, data, null, null);

    public static ApiResponse<T> Fail(
        string code,
        string message,
        IReadOnlyDictionary<string, string[]>? errors = null,
        string? traceId = null)
        => new(false, default, new ApiError(code, message, errors), traceId);
}

public static class ApiResponse
{
    public static ApiResponse<T> Ok<T>(T data) => ApiResponse<T>.Ok(data);

    public static ApiResponse<object?> Ok() => ApiResponse<object?>.Ok(null);

    public static ApiResponse<T> Fail<T>(
        string code,
        string message,
        IReadOnlyDictionary<string, string[]>? errors = null,
        string? traceId = null)
        => ApiResponse<T>.Fail(code, message, errors, traceId);

    public static ApiResponse<object?> Fail(
        string code,
        string message,
        IReadOnlyDictionary<string, string[]>? errors = null,
        string? traceId = null)
        => ApiResponse<object?>.Fail(code, message, errors, traceId);
}
