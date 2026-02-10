using Microsoft.AspNetCore.Http;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Education.Api.Extensions;

public sealed class FormFileOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        if (operation is null || context is null)
        {
            return;
        }

        var formFileParams = context.ApiDescription.ParameterDescriptions
            .Where(p =>
                p.Type == typeof(IFormFile) ||
                p.Type == typeof(IFormFileCollection));

        if (!formFileParams.Any())
        {
            return;
        }

        var properties = new Dictionary<string, OpenApiSchema>(StringComparer.Ordinal);
        var required = new HashSet<string>(StringComparer.Ordinal);

        foreach (var param in formFileParams)
        {
            var name = string.IsNullOrWhiteSpace(param.Name) ? "file" : param.Name;
            properties[name] = new OpenApiSchema
            {
                Type = "string",
                Format = "binary"
            };

            if (param.IsRequired)
            {
                required.Add(name);
            }
        }

        operation.RequestBody = new OpenApiRequestBody
        {
            Content =
            {
                ["multipart/form-data"] = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Type = "object",
                        Properties = properties,
                        Required = required.Count > 0 ? required : null
                    }
                }
            }
        };
    }
}
