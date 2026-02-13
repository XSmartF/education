using Education.Api.Extensions;
using Education.Application;
using Education.Infrastructure;
using Education.Infrastructure.Data;
using Education.Infrastructure.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var migrateOnStartup = builder.Configuration.GetValue("Startup:MigrateOnStartup", true);
var seedDataOnStartup = builder.Configuration.GetValue("Startup:SeedDataOnStartup", true);

var app = builder.Build();

try
{
    await using var scope = app.Services.CreateAsyncScope();
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<AppDbContext>();
    var logger = services.GetRequiredService<ILogger<Program>>();

    if (migrateOnStartup)
    {
        await dbContext.Database.MigrateAsync();
    }
    else
    {
        logger.LogInformation("Database migration on startup is disabled.");
    }

    if (seedDataOnStartup)
    {
        await RoleSeeder.EnsureRolesAsync(services);
    }
    else
    {
        logger.LogInformation("Seed data on startup is disabled.");
    }
}
catch (Exception ex)
{
	var logger = app.Services.GetRequiredService<ILogger<Program>>();
	logger.LogError(ex, "An error occurred while migrating or seeding during startup.");
}

app.UseApiPipeline();

app.Run();
