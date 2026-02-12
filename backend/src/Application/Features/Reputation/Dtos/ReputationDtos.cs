namespace Education.Application.Features.Reputation.Dtos;

public sealed record ReputationProfileDto(
    Guid UserId,
    int LearningScore,
    int ContributionScore,
    int TeachingScore,
    int TrustScore,
    DateTimeOffset UpdatedAt);
