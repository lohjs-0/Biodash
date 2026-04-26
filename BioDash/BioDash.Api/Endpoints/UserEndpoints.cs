using System.Security.Claims;
using BioDash.Api.Data;
using BioDash.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BioDash.Api.Endpoints;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/users")
                       .WithTags("Users")
                       .RequireAuthorization();

        group.MapDelete("/me", async (
            [FromBody] DeleteAccountRequest req,
            ClaimsPrincipal principal,
            AppDbContext db) =>
        {
            var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            // Include Tanks so EF tracks the full graph before deletion.
            // Cascade rules in AppDbContext handle Readings, AlertRules and AlertLogs automatically.
            var user = await db.Users
                .Include(u => u.Tanks)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user is null)
                return Results.NotFound();

            if (!BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
                return Results.Problem(
                    detail: "Senha incorreta.",
                    statusCode: StatusCodes.Status403Forbidden);

            db.Users.Remove(user);
            await db.SaveChangesAsync();

            return Results.NoContent();
        })
        .WithSummary("Exclui a conta do usuário autenticado e todos os seus dados");

        group.MapPut("/me/password", async (
            [FromBody] ChangePasswordRequest req,
            ClaimsPrincipal principal,
            AppDbContext db) =>
        {
            var userIdStr = principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(userIdStr, out var userId))
                return Results.Unauthorized();

            var user = await db.Users.FindAsync(userId);
            if (user is null)
                return Results.NotFound();

            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, user.PasswordHash))
                return Results.Problem(
                    detail: "Senha atual incorreta.",
                    statusCode: StatusCodes.Status403Forbidden);

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
            user.UpdatedAt    = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.NoContent();
        })
        .WithSummary("Altera a senha do usuário autenticado");
    }
}