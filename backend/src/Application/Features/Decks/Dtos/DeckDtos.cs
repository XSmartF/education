namespace Education.Application.Features.Decks.Dtos;

using System.ComponentModel.DataAnnotations;

public sealed record DeckCardDto(
    Guid Id,
    string FrontText,
    string BackText,
    int Difficulty,
    DateTimeOffset? NextReviewAt);

public sealed record DeckItemDto(
    Guid Id,
    Guid OwnerId,
    string Title,
    string Description,
    string Visibility,
    decimal Price,
    bool IsPublished,
    int CardCount,
    int PurchaseCount,
    decimal RatingAverage);

public sealed record DeckDetailDto(
    Guid Id,
    Guid OwnerId,
    string Title,
    string Description,
    string Visibility,
    decimal Price,
    bool IsPublished,
    int PurchaseCount,
    decimal RatingAverage,
    IReadOnlyList<DeckCardDto> Cards);

public sealed record CreateDeckRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Required][MaxLength(40)] string Visibility,
    [Range(0, 100000000)] decimal Price);

public sealed record UpdateDeckRequest(
    [Required][MaxLength(200)] string Title,
    [Required][MaxLength(4000)] string Description,
    [Required][MaxLength(40)] string Visibility,
    [Range(0, 100000000)] decimal Price);

public sealed record CreateDeckCardRequest(
    [Required][MaxLength(2000)] string FrontText,
    [Required][MaxLength(4000)] string BackText,
    [Range(1, 5)] int Difficulty);
