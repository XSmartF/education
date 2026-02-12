namespace Education.Application.Features.Marketplace.Services;

using Education.Application.Features.Marketplace.Abstractions;
using Education.Application.Features.Marketplace.Dtos;
using Education.Domain.Entities;
using Education.Domain.Interfaces;

public sealed class MarketplaceService : IMarketplaceService
{
    private const decimal CommissionRate = 0.15m;
    private static readonly Guid PlatformWalletUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    private readonly ICourseRepository _courseRepository;
    private readonly IDeckRepository _deckRepository;
    private readonly IWalletRepository _walletRepository;
    private readonly IReputationRepository _reputationRepository;

    public MarketplaceService(
        ICourseRepository courseRepository,
        IDeckRepository deckRepository,
        IWalletRepository walletRepository,
        IReputationRepository reputationRepository)
    {
        _courseRepository = courseRepository;
        _deckRepository = deckRepository;
        _walletRepository = walletRepository;
        _reputationRepository = reputationRepository;
    }

    public async Task<IReadOnlyList<MarketplaceCatalogItemDto>> GetCatalogAsync(CancellationToken cancellationToken = default)
    {
        var courses = await _courseRepository.GetPublishedAsync(cancellationToken);
        var decks = await _deckRepository.GetPublishedAsync(cancellationToken);

        var catalog = new List<MarketplaceCatalogItemDto>(courses.Count + decks.Count);
        catalog.AddRange(courses.Select(x => new MarketplaceCatalogItemDto(
            x.Id,
            "course",
            x.TeacherId,
            x.Title,
            x.Description,
            x.Price,
            x.Price <= 0m)));

        catalog.AddRange(decks.Select(x => new MarketplaceCatalogItemDto(
            x.Id,
            "deck",
            x.OwnerId,
            x.Title,
            x.Description,
            x.Price,
            x.Price <= 0m || x.Visibility == "public_free")));

        return catalog.OrderBy(x => x.IsFree).ThenBy(x => x.Price).ToList();
    }

    public async Task<PurchaseItemResultDto?> PurchaseCourseAsync(
        Guid buyerId,
        Guid courseId,
        CancellationToken cancellationToken = default)
    {
        var course = await _courseRepository.GetByIdAsync(courseId, includeDetails: true, cancellationToken);
        if (course is null || !course.IsPublished || !course.IsPublic)
        {
            return null;
        }

        if (course.TeacherId == buyerId)
        {
            return new PurchaseItemResultDto("course", courseId, 0m, 0m, 0m, 0m, "owner");
        }

        var existingEnrollment = await _courseRepository.GetEnrollmentAsync(courseId, buyerId, cancellationToken);
        if (existingEnrollment is not null)
        {
            return new PurchaseItemResultDto("course", courseId, 0m, 0m, 0m, 0m, "already_enrolled");
        }

        var amount = Math.Max(0m, course.Price);
        var buyerWallet = await _walletRepository.GetOrCreateWalletAsync(buyerId, cancellationToken);
        var commissionAmount = 0m;
        var sellerPayout = 0m;
        if (amount > 0m)
        {
            if (buyerWallet.Balance < amount)
            {
                throw new InvalidOperationException("insufficient_funds");
            }

            commissionAmount = RoundMoney(amount * CommissionRate);
            sellerPayout = amount - commissionAmount;

            var sellerWallet = await _walletRepository.GetOrCreateWalletAsync(course.TeacherId, cancellationToken);
            var platformWallet = await _walletRepository.GetOrCreateWalletAsync(PlatformWalletUserId, cancellationToken);
            buyerWallet.Balance -= amount;
            sellerWallet.Balance += sellerPayout;
            platformWallet.Balance += commissionAmount;

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = buyerWallet.Id,
                Type = "purchase_course",
                Amount = -amount,
                Description = $"Purchase course: {course.Title}",
                ReferenceType = "course",
                ReferenceId = course.Id,
            }, cancellationToken);

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = sellerWallet.Id,
                Type = "sale_course",
                Amount = sellerPayout,
                Description = $"Sale course: {course.Title}",
                ReferenceType = "course",
                ReferenceId = course.Id,
            }, cancellationToken);

            if (commissionAmount > 0m)
            {
                await _walletRepository.AddTransactionAsync(new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = platformWallet.Id,
                    Type = "commission_course",
                    Amount = commissionAmount,
                    Description = $"Commission course: {course.Title}",
                    ReferenceType = "course",
                    ReferenceId = course.Id,
                }, cancellationToken);
            }
        }

        await _courseRepository.AddEnrollmentAsync(new CourseEnrollment
        {
            Id = Guid.NewGuid(),
            CourseId = course.Id,
            StudentId = buyerId,
            CompletionRate = 0m,
            IsCompleted = false,
        }, cancellationToken);

        var buyerRep = await _reputationRepository.GetOrCreateAsync(buyerId, cancellationToken);
        buyerRep.LearningScore += 2;
        buyerRep.TrustScore += 1;

        var teacherRep = await _reputationRepository.GetOrCreateAsync(course.TeacherId, cancellationToken);
        teacherRep.TeachingScore += 2;
        teacherRep.TrustScore += 1;

        await _walletRepository.SaveChangesAsync(cancellationToken);

        return new PurchaseItemResultDto(
            "course",
            course.Id,
            amount,
            commissionAmount,
            sellerPayout,
            buyerWallet.Balance,
            amount <= 0m ? "enrolled_free" : "purchased");
    }

    public async Task<PurchaseItemResultDto?> PurchaseDeckAsync(
        Guid buyerId,
        Guid deckId,
        CancellationToken cancellationToken = default)
    {
        var deck = await _deckRepository.GetByIdAsync(deckId, includeDetails: true, cancellationToken);
        if (deck is null || !deck.IsPublished || deck.Visibility == "private")
        {
            return null;
        }

        if (deck.OwnerId == buyerId)
        {
            return new PurchaseItemResultDto("deck", deckId, 0m, 0m, 0m, 0m, "owner");
        }

        var existingPurchase = await _deckRepository.GetPurchaseAsync(deckId, buyerId, cancellationToken);
        if (existingPurchase is not null)
        {
            return new PurchaseItemResultDto("deck", deckId, 0m, 0m, 0m, 0m, "already_purchased");
        }

        var amount = deck.Visibility == "public_paid" ? Math.Max(0m, deck.Price) : 0m;
        var buyerWallet = await _walletRepository.GetOrCreateWalletAsync(buyerId, cancellationToken);
        var commissionAmount = 0m;
        var sellerPayout = 0m;
        if (amount > 0m)
        {
            if (buyerWallet.Balance < amount)
            {
                throw new InvalidOperationException("insufficient_funds");
            }

            commissionAmount = RoundMoney(amount * CommissionRate);
            sellerPayout = amount - commissionAmount;

            var sellerWallet = await _walletRepository.GetOrCreateWalletAsync(deck.OwnerId, cancellationToken);
            var platformWallet = await _walletRepository.GetOrCreateWalletAsync(PlatformWalletUserId, cancellationToken);
            buyerWallet.Balance -= amount;
            sellerWallet.Balance += sellerPayout;
            platformWallet.Balance += commissionAmount;

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = buyerWallet.Id,
                Type = "purchase_deck",
                Amount = -amount,
                Description = $"Purchase deck: {deck.Title}",
                ReferenceType = "deck",
                ReferenceId = deck.Id,
            }, cancellationToken);

            await _walletRepository.AddTransactionAsync(new WalletTransaction
            {
                Id = Guid.NewGuid(),
                WalletId = sellerWallet.Id,
                Type = "sale_deck",
                Amount = sellerPayout,
                Description = $"Sale deck: {deck.Title}",
                ReferenceType = "deck",
                ReferenceId = deck.Id,
            }, cancellationToken);

            if (commissionAmount > 0m)
            {
                await _walletRepository.AddTransactionAsync(new WalletTransaction
                {
                    Id = Guid.NewGuid(),
                    WalletId = platformWallet.Id,
                    Type = "commission_deck",
                    Amount = commissionAmount,
                    Description = $"Commission deck: {deck.Title}",
                    ReferenceType = "deck",
                    ReferenceId = deck.Id,
                }, cancellationToken);
            }
        }

        await _deckRepository.AddPurchaseAsync(new DeckPurchase
        {
            Id = Guid.NewGuid(),
            DeckId = deck.Id,
            BuyerId = buyerId,
            Price = amount,
        }, cancellationToken);

        deck.PurchaseCount += 1;
        _deckRepository.UpdateDeck(deck);

        var buyerRep = await _reputationRepository.GetOrCreateAsync(buyerId, cancellationToken);
        buyerRep.LearningScore += 1;

        var ownerRep = await _reputationRepository.GetOrCreateAsync(deck.OwnerId, cancellationToken);
        ownerRep.ContributionScore += 2;
        ownerRep.TrustScore += 1;

        await _walletRepository.SaveChangesAsync(cancellationToken);

        return new PurchaseItemResultDto(
            "deck",
            deck.Id,
            amount,
            commissionAmount,
            sellerPayout,
            buyerWallet.Balance,
            amount <= 0m ? "claimed_free" : "purchased");
    }

    private static decimal RoundMoney(decimal value)
    {
        return decimal.Round(value, 2, MidpointRounding.AwayFromZero);
    }
}
