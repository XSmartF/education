namespace Education.Domain.Entities;

public sealed class ReputationProfile : AuditableEntity
{
    public Guid UserId { get; set; }
    public int LearningScore { get; set; }
    public int ContributionScore { get; set; }
    public int TeachingScore { get; set; }
    public int TrustScore { get; set; }
}
