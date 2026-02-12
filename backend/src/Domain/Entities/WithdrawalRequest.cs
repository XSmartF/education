namespace Education.Domain.Entities;

public sealed class WithdrawalRequest : AuditableEntity
{
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Status { get; set; } = "pending";
    public DateTimeOffset? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? Note { get; set; }
}
