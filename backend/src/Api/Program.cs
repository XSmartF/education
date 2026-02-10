using Education.Api.Extensions;
using Education.Application;
using Education.Infrastructure;
using Education.Infrastructure.Identity;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApiServices(builder.Configuration);
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

var app = builder.Build();

await RoleSeeder.EnsureRolesAsync(app.Services);

app.UseApiPipeline();

app.Run();
