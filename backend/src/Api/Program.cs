using Education.Api.Extensions;
using Education.Application;
using Education.Infrastructure;
using Education.Infrastructure.Identity;
using Microsoft.Extensions.Logging;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

try
{
	await RoleSeeder.EnsureRolesAsync(app.Services);
}
catch (Exception ex)
{
	var logger = app.Services.GetRequiredService<ILogger<Program>>();
	logger.LogError(ex, "An error occurred while seeding roles during startup.");
}

app.UseApiPipeline();

app.Run();
