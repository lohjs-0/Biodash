using System.Security.Claims;
using BioDash.Api.Data;
using BioDash.Api.DTOs;
using Microsoft.EntityFrameworkCore;

namespace BioDash.Api.Endpoints;

public static class AlertEndpoints
{
    public static void MapAlertEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/alerts")
            .WithTags("Alerts")
            .RequireAuthorization();

        group.MapGet("/", async (ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);

            var logs = await db.AlertLogs
                .Include(a => a.Tank)
                .Where(a => a.Tank.UserId == userId)
                .OrderByDescending(a => a.TriggeredAt)
                .Take(200)
                .AsNoTracking()
                .Select(a => new AlertLogDto(
                    a.Id,
                    a.TankId,
                    a.Tank.Name,
                    a.Parameter,
                    a.Value,
                    a.MinValue,
                    a.MaxValue,
                    a.TriggeredAt,
                    a.Resolved,
                    a.ResolvedAt
                ))
                .ToListAsync();

            return Results.Ok(logs);
        })
        .WithSummary("Lista todos os alertas disparados do usuário");

        group.MapPatch("/{id:int}/resolve", async (int id, ClaimsPrincipal user, AppDbContext db) =>
        {
            var userId = GetUserId(user);

            var log = await db.AlertLogs
                .Include(a => a.Tank)
                .FirstOrDefaultAsync(a => a.Id == id && a.Tank.UserId == userId);

            if (log is null) return Results.NotFound();
            if (log.Resolved) return Results.Ok(log);

            log.Resolved   = true;
            log.ResolvedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();

            return Results.NoContent();
        })
        .WithSummary("Marca um alerta como resolvido");
    }

    private static int GetUserId(ClaimsPrincipal user) =>
        int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new UnauthorizedAccessException("Token inválido.");
}