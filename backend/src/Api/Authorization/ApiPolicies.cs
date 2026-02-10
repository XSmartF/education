namespace Education.Api.Authorization;

public static class ApiPolicies
{
    public const string AdminOnly = "AdminOnly";
    public const string StudentOnly = "StudentOnly";
    public const string TeacherOnly = "TeacherOnly";
    public const string OrganizeOnly = "OrganizeOnly";
    public const string AppAccess = "AppAccess";
}
