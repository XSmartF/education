namespace Education.Domain.Entities;

public sealed class Wallet : AuditableEntity
{
    public Guid UserId { get; set; }
    public decimal Balance { get; set; }
    public ICollection<WalletTransaction> Transactions { get; set; } = new List<WalletTransaction>();
}
