namespace Education.Application.Features.Reputation.Services;

using Education.Application.Features.Reputation.Abstractions;
using Education.Application.Features.Reputation.Dtos;
using Education.Domain.Entities;
using Education.Domain.Interfaces;

public sealed class ReputationService : IReputationService
{
    private readonly IReputationRepository _repository;

    public ReputationService(IReputationRepository repository)
    {
        _repository = repository;
    }

    public async Task<ReputationProfileDto> GetMyProfileAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _repository.GetOrCreateAsync(userId, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
        return Map(profile);
    }

    public async Task<ReputationProfileDto?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var profile = await _repository.GetByUserIdAsync(userId, cancellationToken);
        return profile is null ? null : Map(profile);
    }

    public async Task ApplyLearningScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default)
    {
        var profile = await _repository.GetOrCreateAsync(userId, cancellationToken);
        profile.LearningScore += delta;
        profile.TrustScore += Math.Clamp(delta / 10, 0, 3);
        await _repository.SaveChangesAsync(cancellationToken);
    }

    public async Task ApplyContributionScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default)
    {
        var profile = await _repository.GetOrCreateAsync(userId, cancellationToken);
        profile.ContributionScore += delta;
        profile.TrustScore += Math.Clamp(delta / 10, 0, 2);
        await _repository.SaveChangesAsync(cancellationToken);
    }

    public async Task ApplyTeachingScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default)
    {
        var profile = await _repository.GetOrCreateAsync(userId, cancellationToken);
        profile.TeachingScore += delta;
        profile.TrustScore += Math.Clamp(delta / 10, 0, 3);
        await _repository.SaveChangesAsync(cancellationToken);
    }

    private static ReputationProfileDto Map(ReputationProfile profile)
    {
        return new ReputationProfileDto(
            profile.UserId,
            profile.LearningScore,
            profile.ContributionScore,
            profile.TeachingScore,
            profile.TrustScore,
            profile.UpdatedAt ?? profile.CreatedAt);
    }
}
