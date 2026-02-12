namespace Education.Application.Features.Reputation.Abstractions;

using Education.Application.Features.Reputation.Dtos;

public interface IReputationService
{
    Task<ReputationProfileDto> GetMyProfileAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<ReputationProfileDto?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task ApplyLearningScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default);
    Task ApplyContributionScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default);
    Task ApplyTeachingScoreAsync(Guid userId, int delta, CancellationToken cancellationToken = default);
}
