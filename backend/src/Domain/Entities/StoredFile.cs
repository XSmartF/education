namespace Education.Domain.Entities;

public sealed class StoredFile : AuditableEntity
{
    public string OriginalName { get; set; } = string.Empty;
    public string StoredName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
    public long Size { get; set; }
    public string RelativePath { get; set; } = string.Empty;
}