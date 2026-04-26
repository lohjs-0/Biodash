using BioDash.Api.Data;
using BioDash.Api.Data.Repositories;
using BioDash.Api.DTOs;
using BioDash.Api.Hubs;
using BioDash.Api.Models;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace BioDash.Api.Services;

public class SensorSimulator(
    IServiceScopeFactory scopeFactory,
    IHubContext<TankHub> hub) : BackgroundService
{
    private readonly Random _rng = new();

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            await SimulateReadings(ct);
            await Task.Delay(TimeSpan.FromSeconds(5), ct);
        }
    }

    private async Task SimulateReadings(CancellationToken ct)
    {
        using var scope = scopeFactory.CreateScope();
        var tankRepo    = scope.ServiceProvider.GetRequiredService<ITankRepository>();
        var db          = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var tankIds = await tankRepo.GetAllOnlineIdsAsync();
        if (tankIds.Count == 0) return;

        var readings = tankIds.Select(id =>
        {
            var forceAlert = _rng.NextDouble() < 0.3;
            return new Reading
            {
                TankId      = id,
                Level       = Math.Round(40 + _rng.NextDouble() * 50,                                            1),
                Temperature = Math.Round(forceAlert ? 36 + _rng.NextDouble() * 5  : 18 + _rng.NextDouble() * 12, 1),
                Ph          = Math.Round(forceAlert ? 5.0 + _rng.NextDouble() * 0.8 : 6.5 + _rng.NextDouble() * 1.5, 2),
                RecordedAt  = DateTime.UtcNow,
            };
        }).ToList();

        // Salva todas as leituras de uma vez
        db.Readings.AddRange(readings);
        await db.SaveChangesAsync(ct);

        // Verifica regras e grava AlertLogs
        await CheckAndLogAlertsAsync(db, readings, ct);

        // Notifica cada tank via SignalR em paralelo
        var tasks = readings.Select(r =>
        {
            var dto = new ReadingDto(r.Id, r.TankId, r.Level, r.Temperature, r.Ph, r.RecordedAt);
            return hub.Clients
                .Group($"tank-{r.TankId}")
                .SendAsync("NewReading", dto, ct);
        });

        await Task.WhenAll(tasks);
    }

    private static async Task CheckAndLogAlertsAsync(AppDbContext db, List<Reading> readings, CancellationToken ct)
    {
        var tankIds = readings.Select(r => r.TankId).Distinct().ToList();

        var rules = await db.AlertRules
            .Where(a => tankIds.Contains(a.TankId) && a.IsActive)
            .ToListAsync(ct);

        var alertLogs = new List<AlertLog>();

        foreach (var reading in readings)
        {
            var tankRules = rules.Where(r => r.TankId == reading.TankId);

            foreach (var rule in tankRules)
            {
                var value = rule.Parameter switch
                {
                    "temperature" => reading.Temperature,
                    "ph"          => reading.Ph,
                    "level"       => reading.Level,
                    _             => double.NaN,
                };

                if (double.IsNaN(value)) continue;
                if (value >= rule.MinValue && value <= rule.MaxValue) continue;

                alertLogs.Add(new AlertLog
                {
                    TankId      = reading.TankId,
                    Parameter   = rule.Parameter,
                    Value       = value,
                    MinValue    = rule.MinValue,
                    MaxValue    = rule.MaxValue,
                    TriggeredAt = reading.RecordedAt,
                    Resolved    = false,
                });
            }
        }

        if (alertLogs.Count == 0) return;

        db.AlertLogs.AddRange(alertLogs);
        await db.SaveChangesAsync(ct);
    }
}