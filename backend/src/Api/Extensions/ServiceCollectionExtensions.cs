using System.Globalization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Education.Api.Authorization;
using Education.Api.Contracts;
using Education.Infrastructure.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.OpenApi.Models;

namespace Education.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers()
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(entry => entry.Value?.Errors.Count > 0)
                        .ToDictionary(
                            entry => entry.Key,
                            entry => entry.Value!.Errors
                                .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Invalid value." : error.ErrorMessage)
                                .ToArray());

                    var response = ApiResponse.Fail(
                        ApiErrorCodes.ValidationError,
                        "Validation failed.",
                        errors,
                        context.HttpContext.TraceIdentifier);

                    return new BadRequestObjectResult(response);
                };
            });
        services.AddEndpointsApiExplorer();
        services.AddHealthChecks();

        services.AddAuthorization(options =>
        {
            options.AddPolicy(ApiPolicies.AdminOnly, policy => policy.RequireRole(RoleNames.Admin));
            options.AddPolicy(ApiPolicies.StudentOnly, policy => policy.RequireRole(RoleNames.Admin, RoleNames.Student));
            options.AddPolicy(ApiPolicies.TeacherOnly, policy => policy.RequireRole(RoleNames.Admin, RoleNames.Teacher));
            options.AddPolicy(ApiPolicies.OrganizeOnly, policy => policy.RequireRole(RoleNames.Admin, RoleNames.Organize));
            options.AddPolicy(
                ApiPolicies.AppAccess,
                policy => policy.RequireRole(RoleNames.Admin, RoleNames.Student, RoleNames.Teacher, RoleNames.Organize));
        });

        var origins = configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
        services.AddCors(options =>
        {
            options.AddPolicy("Default", policy =>
            {
                if (origins.Length == 0)
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                }
                else
                {
                    policy.WithOrigins(origins)
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials();
                }
            });
        });

        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddFixedWindowLimiter("auth", limiterOptions =>
            {
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.PermitLimit = 10;
                limiterOptions.QueueLimit = 0;
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            });

            options.AddFixedWindowLimiter("global", limiterOptions =>
            {
                limiterOptions.Window = TimeSpan.FromMinutes(1);
                limiterOptions.PermitLimit = 120;
                limiterOptions.QueueLimit = 0;
                limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
            });
        });

        services.AddLocalization(options => options.ResourcesPath = "Resources");
        services.Configure<RequestLocalizationOptions>(options =>
        {
            var supportedCultures = new[]
            {
                new CultureInfo("vi-VN"),
                new CultureInfo("en-US")
            };

            options.DefaultRequestCulture = new RequestCulture("vi-VN");
            options.SupportedCultures = supportedCultures;
            options.SupportedUICultures = supportedCultures;
            options.ApplyCurrentCultureToResponseHeaders = true;
        });

        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo { Title = "Education API", Version = "v1" });
            options.OperationFilter<FormFileOperationFilter>();
            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Nhap 'Bearer {token}'"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
                    },
                    Array.Empty<string>()
                }
            });

            options.OperationFilter<Education.Api.Swagger.FileUploadOperationFilter>();
        });

        return services;
    }
}
