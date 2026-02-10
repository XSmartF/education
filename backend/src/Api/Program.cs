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

var app = builder.Build();

try
{
    await using var scope = app.Services.CreateAsyncScope();
    var services = scope.ServiceProvider;
    var dbContext = services.GetRequiredService<AppDbContext>();
    await dbContext.Database.MigrateAsync();
    await RoleSeeder.EnsureRolesAsync(services);
}
catch (Exception ex)
{
	var logger = app.Services.GetRequiredService<ILogger<Program>>();
	logger.LogError(ex, "An error occurred while migrating or seeding during startup.");
}

app.UseApiPipeline();

app.Run();
