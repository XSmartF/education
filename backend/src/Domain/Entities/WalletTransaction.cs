namespace Education.Domain.Entities;

public sealed class WalletTransaction : AuditableEntity
{
    public Guid WalletId { get; set; }
    public Wallet Wallet { get; set; } = null!;
    public string Type { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public string? ReferenceType { get; set; }
    public Guid? ReferenceId { get; set; }
}
