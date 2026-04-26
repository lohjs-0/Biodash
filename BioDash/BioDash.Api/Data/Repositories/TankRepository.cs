using BioDash.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BioDash.Api.Data.Repositories;

public class TankRepository(AppDbContext db) : ITankRepository
{
    public Task<List<Tank>> GetAllByUserAsync(int userId) =>
        db.Tanks
            .Include(t => t.Readings.OrderByDescending(r => r.RecordedAt).Take(1))
            .Include(t => t.AlertRules.Where(a => a.IsActive))
            .Where(t => t.UserId == userId)
            .AsNoTracking()
            .ToListAsync();

    public Task<Tank?> GetByIdAsync(int id, int userId) =>
        db.Tanks
            .Include(t => t.Readings.OrderByDescending(r => r.RecordedAt).Take(1))
            .Include(t => t.AlertRules)
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

    public Task<List<int>> GetAllOnlineIdsAsync() =>
        db.Tanks
            .Where(t => t.IsOnline)
            .Select(t => t.Id)
            .ToListAsync();

    public async Task<Tank> CreateAsync(Tank tank)
    {
        db.Tanks.Add(tank);
        await db.SaveChangesAsync();
        return tank;
    }

    public Task UpdateAsync(Tank tank)
    {
        db.Tanks.Update(tank);
        return db.SaveChangesAsync();
    }

    public Task DeleteAsync(Tank tank)
    {
        db.Tanks.Remove(tank);
        return db.SaveChangesAsync();
    }

    public Task<List<Reading>> GetReadingsAsync(int tankId, int hours)
    {
        var since = DateTime.UtcNow.AddHours(-hours);
        return db.Readings
            .Where(r => r.TankId == tankId && r.RecordedAt >= since)
            .OrderBy(r => r.RecordedAt)
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task AddReadingAsync(Reading reading)
    {
        db.Readings.Add(reading);
        await db.SaveChangesAsync();
    }

    public Task<List<AlertRule>> GetAlertRulesAsync(int tankId) =>
        db.AlertRules
            .Where(a => a.TankId == tankId)
            .AsNoTracking()
            .ToListAsync();

    public Task<AlertRule?> GetAlertRuleByIdAsync(int ruleId, int tankId) =>
        db.AlertRules.FirstOrDefaultAsync(a => a.Id == ruleId && a.TankId == tankId);

    public async Task<AlertRule> AddAlertRuleAsync(AlertRule rule)
    {
        db.AlertRules.Add(rule);
        await db.SaveChangesAsync();
        return rule;
    }

    public Task UpdateAlertRuleAsync(AlertRule rule)
    {
        db.AlertRules.Update(rule);
        return db.SaveChangesAsync();
    }

    public Task DeleteAlertRuleAsync(AlertRule rule)
    {
        db.AlertRules.Remove(rule);
        return db.SaveChangesAsync();
    }

    public Task<int> CountTanksAsync(int userId) =>
        db.Tanks.CountAsync(t => t.UserId == userId);

    public async Task<int> CountAlertsTodayAsync(int userId)
    {
        var since = DateTime.UtcNow.AddHours(-24);
        var tankIds = await db.Tanks
            .Where(t => t.UserId == userId)
            .Select(t => t.Id)
            .ToListAsync();

        return await db.Readings
            .Where(r => tankIds.Contains(r.TankId) && r.RecordedAt >= since)
            .Join(db.AlertRules.Where(a => a.IsActive),
                r => r.TankId,
                a => a.TankId,
                (r, a) => new { r, a })
            .CountAsync(x =>
                (x.a.Parameter == "temperature" && (x.r.Temperature < x.a.MinValue || x.r.Temperature > x.a.MaxValue)) ||
                (x.a.Parameter == "ph"          && (x.r.Ph          < x.a.MinValue || x.r.Ph          > x.a.MaxValue)) ||
                (x.a.Parameter == "level"       && (x.r.Level       < x.a.MinValue || x.r.Level       > x.a.MaxValue))
            );
    }

    public async Task<double> AverageReadingAsync(int userId, string parameter)
    {
        var since = DateTime.UtcNow.AddHours(-24);
        var tankIds = await db.Tanks
            .Where(t => t.UserId == userId)
            .Select(t => t.Id)
            .ToListAsync();

        var readings = db.Readings
            .Where(r => tankIds.Contains(r.TankId) && r.RecordedAt >= since);

        return parameter switch
        {
            "temperature" => await readings.AverageAsync(r => (double?)r.Temperature) ?? 0,
            "ph"          => await readings.AverageAsync(r => (double?)r.Ph)          ?? 0,
            "level"       => await readings.AverageAsync(r => (double?)r.Level)       ?? 0,
            _             => 0
        };
    }
}