using Education.Domain.Entities;

namespace Education.Domain.Interfaces;

public interface IReputationRepository
{
    Task<ReputationProfile> GetOrCreateAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ReputationProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    void Update(ReputationProfile profile);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
