namespace Education.Application;

using Education.Application.Features.Files.Abstractions;
using Education.Application.Features.Files.Services;
using Education.Application.Features.Courses.Abstractions;
using Education.Application.Features.Courses.Services;
using Education.Application.Features.Decks.Abstractions;
using Education.Application.Features.Decks.Services;
using Education.Application.Features.Marketplace.Abstractions;
using Education.Application.Features.Marketplace.Services;
using Education.Application.Features.Reputation.Abstractions;
using Education.Application.Features.Reputation.Services;
using Education.Application.Features.Todos.Abstractions;
using Education.Application.Features.Todos.Services;
using Education.Application.Features.Wallets.Abstractions;
using Education.Application.Features.Wallets.Services;
using Education.Application.Mapping;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile).Assembly);
        services.AddScoped<ITodoService, TodoService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<ICourseService, CourseService>();
        services.AddScoped<IDeckService, DeckService>();
        services.AddScoped<IWalletService, WalletService>();
        services.AddScoped<IMarketplaceService, MarketplaceService>();
        services.AddScoped<IReputationService, ReputationService>();
        return services;
    }
}
