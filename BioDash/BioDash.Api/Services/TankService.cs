using BioDash.Api.Data.Repositories;
using BioDash.Api.DTOs;
using BioDash.Api.Models;

namespace BioDash.Api.Services;

public class TankService(ITankRepository tankRepo)
{
    public async Task<List<TankDto>> GetAllAsync(int userId)
    {
        var tanks = await tankRepo.GetAllByUserAsync(userId);
        return tanks.Select(ToDto).ToList();
    }

    public async Task<TankDto?> GetByIdAsync(int id, int userId)
    {
        var tank = await tankRepo.GetByIdAsync(id, userId);
        return tank is null ? null : ToDto(tank);
    }

    public async Task<TankDto> CreateAsync(CreateTankRequest req, int userId)
    {
        var tank = new Tank
        {
            UserId       = userId,
            Name         = req.Name.Trim(),
            Description  = req.Description.Trim(),
            VolumeLiters = req.VolumeLiters,
            AlertRules   =
            [
                new AlertRule { Parameter = "temperature", MinValue = 10,  MaxValue = 35,  IsActive = true },
                new AlertRule { Parameter = "ph",          MinValue = 6.0, MaxValue = 8.5, IsActive = true },
                new AlertRule { Parameter = "level",       MinValue = 10,  MaxValue = 95,  IsActive = true },
            ]
        };

        await tankRepo.CreateAsync(tank);
        return ToDto(tank);
    }

    public async Task<TankDto?> UpdateAsync(int id, int userId, UpdateTankRequest req)
    {
        var tank = await tankRepo.GetByIdAsync(id, userId);
        if (tank is null) return null;

        tank.Name         = req.Name.Trim();
        tank.Description  = req.Description.Trim();
        tank.VolumeLiters = req.VolumeLiters;
        tank.UpdatedAt    = DateTime.UtcNow;

        await tankRepo.UpdateAsync(tank);
        return ToDto(tank);
    }

    public async Task<bool> DeleteAsync(int id, int userId)
    {
        var tank = await tankRepo.GetByIdAsync(id, userId);
        if (tank is null) return false;

        await tankRepo.DeleteAsync(tank);
        return true;
    }

    public async Task<bool> ToggleOnlineAsync(int id, int userId)
    {
        var tank = await tankRepo.GetByIdAsync(id, userId);
        if (tank is null) return false;

        tank.IsOnline  = !tank.IsOnline;
        tank.UpdatedAt = DateTime.UtcNow;
        await tankRepo.UpdateAsync(tank);
        return true;
    }

    public async Task<List<ReadingDto>> GetReadingsAsync(int tankId, int userId, int hours = 24)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return [];

        var readings = await tankRepo.GetReadingsAsync(tankId, hours);
        return readings
            .Select(r => new ReadingDto(r.Id, r.TankId, r.Level, r.Temperature, r.Ph, r.RecordedAt))
            .ToList();
    }

    public async Task<ReadingHistoryDto?> GetReadingHistoryAsync(int tankId, int userId, int hours = 24)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return null;

        var readings = await tankRepo.GetReadingsAsync(tankId, hours);
        if (readings.Count == 0)
            return new ReadingHistoryDto(0, 0, 0, 0, 0, 0, 0, 0);

        return new ReadingHistoryDto(
            AvgLevel:       Math.Round(readings.Average(r => r.Level),       2),
            AvgTemperature: Math.Round(readings.Average(r => r.Temperature), 2),
            AvgPh:          Math.Round(readings.Average(r => r.Ph),          2),
            MaxTemperature: readings.Max(r => r.Temperature),
            MinTemperature: readings.Min(r => r.Temperature),
            MaxPh:          readings.Max(r => r.Ph),
            MinPh:          readings.Min(r => r.Ph),
            TotalReadings:  readings.Count
        );
    }

    public async Task<List<AlertRuleDto>> GetAlertRulesAsync(int tankId, int userId)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return [];

        var rules = await tankRepo.GetAlertRulesAsync(tankId);
        return rules.Select(ToAlertRuleDto).ToList();
    }

    public async Task<AlertRuleDto?> CreateAlertRuleAsync(int tankId, int userId, CreateAlertRuleRequest req)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return null;

        if (req.MinValue >= req.MaxValue)
            throw new ArgumentException("MinValue deve ser menor que MaxValue.");

        var rule = new AlertRule
        {
            TankId    = tankId,
            Parameter = req.Parameter.Trim().ToLowerInvariant(),
            MinValue  = req.MinValue,
            MaxValue  = req.MaxValue,
            IsActive  = true,
        };

        await tankRepo.AddAlertRuleAsync(rule);
        return ToAlertRuleDto(rule);
    }

    public async Task<AlertRuleDto?> UpdateAlertRuleAsync(int tankId, int userId, int ruleId, UpdateAlertRuleRequest req)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return null;

        var rule = await tankRepo.GetAlertRuleByIdAsync(ruleId, tankId);
        if (rule is null) return null;

        if (req.MinValue >= req.MaxValue)
            throw new ArgumentException("MinValue deve ser menor que MaxValue.");

        rule.MinValue = req.MinValue;
        rule.MaxValue = req.MaxValue;

        await tankRepo.UpdateAlertRuleAsync(rule);
        return ToAlertRuleDto(rule);
    }

    public async Task<bool> DeleteAlertRuleAsync(int tankId, int userId, int ruleId)
    {
        var tank = await tankRepo.GetByIdAsync(tankId, userId);
        if (tank is null) return false;

        var rule = await tankRepo.GetAlertRuleByIdAsync(ruleId, tankId);
        if (rule is null) return false;

        await tankRepo.DeleteAlertRuleAsync(rule);
        return true;
    }

    public async Task<UserMetricsDto> GetMetricsAsync(int userId)
    {
        var tanks    = await tankRepo.GetAllByUserAsync(userId);
        var total    = tanks.Count;
        var online   = tanks.Count(t => t.IsOnline);
        var alerts   = await tankRepo.CountAlertsTodayAsync(userId);
        var avgTemp  = Math.Round(await tankRepo.AverageReadingAsync(userId, "temperature"), 1);
        var avgPh    = Math.Round(await tankRepo.AverageReadingAsync(userId, "ph"),          2);
        var avgLevel = Math.Round(await tankRepo.AverageReadingAsync(userId, "level"),       1);

        return new UserMetricsDto(total, online, alerts, avgTemp, avgPh, avgLevel);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static TankDto ToDto(Tank tank)
    {
        var last = tank.Readings
            .OrderByDescending(r => r.RecordedAt)
            .FirstOrDefault();

        var alertActive = last is not null && tank.AlertRules.Any(rule =>
            rule.IsActive && (
                (rule.Parameter == "temperature" && (last.Temperature < rule.MinValue || last.Temperature > rule.MaxValue)) ||
                (rule.Parameter == "ph"          && (last.Ph          < rule.MinValue || last.Ph          > rule.MaxValue)) ||
                (rule.Parameter == "level"       && (last.Level       < rule.MinValue || last.Level       > rule.MaxValue))
            )
        );

        return new TankDto(
            tank.Id,
            tank.Name,
            tank.Description,
            tank.VolumeLiters,
            last?.Level       ?? 0,
            last?.Temperature ?? 0,
            last?.Ph          ?? 0,
            tank.IsOnline,
            alertActive,
            tank.CreatedAt,
            tank.UpdatedAt
        );
    }

    private static AlertRuleDto ToAlertRuleDto(AlertRule rule) =>
        new(rule.Id, rule.TankId, rule.Parameter, rule.MinValue, rule.MaxValue, rule.IsActive);
}