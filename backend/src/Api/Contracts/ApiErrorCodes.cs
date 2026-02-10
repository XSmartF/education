namespace Education.Api.Contracts;

public static class ApiErrorCodes
{
    public const string ValidationError = "validation_error";
    public const string NotFound = "not_found";
    public const string Unauthorized = "unauthorized";
    public const string Forbidden = "forbidden";
    public const string Conflict = "conflict";
    public const string BadRequest = "bad_request";
    public const string LockedOut = "locked_out";
    public const string ServerError = "server_error";
}
