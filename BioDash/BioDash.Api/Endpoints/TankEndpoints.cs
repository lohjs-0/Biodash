using System.Security.Claims;
using BioDash.Api.DTOs;
using BioDash.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BioDash.Api.Endpoints;

public static class TankEndpoints
{
    public static void MapTankEndpoints(this WebApplication app)
    {
        var group = app.MapGroup("/api/tanks")
            .WithTags("Tanks")
            .RequireAuthorization();

        var metrics = app.MapGroup("/api/metrics")
            .WithTags("Metrics")
            .RequireAuthorization();

        // ── Tanks ─────────────────────────────────────────────────────────────

        group.MapGet("/", async (ClaimsPrincipal user, TankService svc) =>
            Results.Ok(await svc.GetAllAsync(GetUserId(user))))
            .WithSummary("Lista todos os tanks do usuário");

        group.MapGet("/{id:int}", async (int id, ClaimsPrincipal user, TankService svc) =>
        {
            var tank = await svc.GetByIdAsync(id, GetUserId(user));
            return tank is null ? Results.NotFound() : Results.Ok(tank);
        })
        .WithSummary("Retorna um tank pelo ID");

        group.MapPost("/", async (
            [FromBody] CreateTankRequest req,
            ClaimsPrincipal user,
            TankService svc) =>
        {
            var tank = await svc.CreateAsync(req, GetUserId(user));
            return Results.Created($"/api/tanks/{tank.Id}", tank);
        })
        .WithSummary("Cria um novo tank");

        group.MapPut("/{id:int}", async (
            int id,
            [FromBody] UpdateTankRequest req,
            ClaimsPrincipal user,
            TankService svc) =>
        {
            var tank = await svc.UpdateAsync(id, GetUserId(user), req);
            return tank is null ? Results.NotFound() : Results.Ok(tank);
        })
        .WithSummary("Atualiza um tank");

        group.MapDelete("/{id:int}", async (int id, ClaimsPrincipal user, TankService svc) =>
        {
            var deleted = await svc.DeleteAsync(id, GetUserId(user));
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithSummary("Remove um tank");

        group.MapPatch("/{id:int}/toggle", async (int id, ClaimsPrincipal user, TankService svc) =>
        {
            var ok = await svc.ToggleOnlineAsync(id, GetUserId(user));
            return ok ? Results.NoContent() : Results.NotFound();
        })
        .WithSummary("Alterna o status online/offline do tank");

        // ── Readings ──────────────────────────────────────────────────────────

        group.MapGet("/{id:int}/readings", async (
            int id,
            ClaimsPrincipal user,
            TankService svc,
            [FromQuery] int hours = 24) =>
        {
            if (hours is < 1 or > 168)
                return Results.BadRequest(new { message = "O parâmetro 'hours' deve estar entre 1 e 168." });

            return Results.Ok(await svc.GetReadingsAsync(id, GetUserId(user), hours));
        })
        .WithSummary("Retorna leituras recentes do tank");

        group.MapGet("/{id:int}/readings/history", async (
            int id,
            ClaimsPrincipal user,
            TankService svc,
            [FromQuery] int hours = 24) =>
        {
            if (hours is < 1 or > 168)
                return Results.BadRequest(new { message = "O parâmetro 'hours' deve estar entre 1 e 168." });

            var history = await svc.GetReadingHistoryAsync(id, GetUserId(user), hours);
            return history is null ? Results.NotFound() : Results.Ok(history);
        })
        .WithSummary("Retorna histórico de leituras do tank");

        // ── Alert Rules ───────────────────────────────────────────────────────

        group.MapGet("/{id:int}/alerts", async (int id, ClaimsPrincipal user, TankService svc) =>
            Results.Ok(await svc.GetAlertRulesAsync(id, GetUserId(user))))
            .WithSummary("Lista regras de alerta do tank");

        group.MapPost("/{id:int}/alerts", async (
            int id,
            [FromBody] CreateAlertRuleRequest req,
            ClaimsPrincipal user,
            TankService svc) =>
        {
            var rule = await svc.CreateAlertRuleAsync(id, GetUserId(user), req);
            return rule is null
                ? Results.NotFound()
                : Results.Created($"/api/tanks/{id}/alerts/{rule.Id}", rule);
        })
        .WithSummary("Cria uma regra de alerta para o tank");

        group.MapPut("/{id:int}/alerts/{ruleId:int}", async (
            int id,
            int ruleId,
            [FromBody] UpdateAlertRuleRequest req,
            ClaimsPrincipal user,
            TankService svc) =>
        {
            var rule = await svc.UpdateAlertRuleAsync(id, GetUserId(user), ruleId, req);
            return rule is null ? Results.NotFound() : Results.Ok(rule);
        })
        .WithSummary("Atualiza uma regra de alerta");

        group.MapDelete("/{id:int}/alerts/{ruleId:int}", async (
            int id,
            int ruleId,
            ClaimsPrincipal user,
            TankService svc) =>
        {
            var deleted = await svc.DeleteAlertRuleAsync(id, GetUserId(user), ruleId);
            return deleted ? Results.NoContent() : Results.NotFound();
        })
        .WithSummary("Remove uma regra de alerta");

        // ── Metrics ───────────────────────────────────────────────────────────

        metrics.MapGet("/", async (ClaimsPrincipal user, TankService svc) =>
            Results.Ok(await svc.GetMetricsAsync(GetUserId(user))))
            .WithSummary("Retorna métricas agregadas do usuário");
    }

    private static int GetUserId(ClaimsPrincipal user) =>
        int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id)
            ? id
            : throw new UnauthorizedAccessException("Token inválido: claim de usuário ausente.");
}