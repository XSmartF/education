namespace Education.Infrastructure.Identity;

using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

public static class RoleSeeder
{
    public static async Task EnsureRolesAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        await EnsureRoleAsync(roleManager, RoleNames.Admin);
        await EnsureRoleAsync(roleManager, RoleNames.Student);
        await EnsureRoleAsync(roleManager, RoleNames.Teacher);
        await EnsureRoleAsync(roleManager, RoleNames.Organize);
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole<Guid>> roleManager, string role)
    {
        if (await roleManager.RoleExistsAsync(role))
        {
            return;
        }

        await roleManager.CreateAsync(new IdentityRole<Guid>(role));
    }
}
