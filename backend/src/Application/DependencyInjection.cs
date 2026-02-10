namespace Education.Application;

using Education.Application.Features.Files.Abstractions;
using Education.Application.Features.Files.Services;
using Education.Application.Features.Todos.Abstractions;
using Education.Application.Features.Todos.Services;
using Education.Application.Mapping;
using Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(MappingProfile).Assembly);
        services.AddScoped<ITodoService, TodoService>();
        services.AddScoped<IFileService, FileService>();
        return services;
    }
}
