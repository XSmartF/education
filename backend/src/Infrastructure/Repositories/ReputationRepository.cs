namespace Education.Infrastructure.Repositories;

using Education.Domain.Entities;
using Education.Domain.Interfaces;
using Education.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

public sealed class ReputationRepository : IReputationRepository
{
    private readonly AppDbContext _db;

    public ReputationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<ReputationProfile> GetOrCreateAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _db.ReputationProfiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (profile is not null)
        {
            return profile;
        }

        profile = new ReputationProfile
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            TrustScore = 10
        };
        await _db.ReputationProfiles.AddAsync(profile, cancellationToken);
        return profile;
    }

    public Task<ReputationProfile?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _db.ReputationProfiles.AsNoTracking().FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public void Update(ReputationProfile profile)
    {
        _db.ReputationProfiles.Update(profile);
    }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _db.SaveChangesAsync(cancellationToken);
    }
}
