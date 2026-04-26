using BioDash.Api.Models;

namespace BioDash.Api.Data.Repositories;

public interface ITankRepository
{
    Task<List<Tank>> GetAllByUserAsync(int userId);
    Task<Tank?> GetByIdAsync(int id, int userId);
    Task<List<int>> GetAllOnlineIdsAsync();
    Task<Tank> CreateAsync(Tank tank);
    Task UpdateAsync(Tank tank);
    Task DeleteAsync(Tank tank);
    Task<List<Reading>> GetReadingsAsync(int tankId, int hours);
    Task AddReadingAsync(Reading reading);
    Task<List<AlertRule>> GetAlertRulesAsync(int tankId);
    Task<AlertRule?> GetAlertRuleByIdAsync(int ruleId, int tankId);
    Task<AlertRule> AddAlertRuleAsync(AlertRule rule);
    Task UpdateAlertRuleAsync(AlertRule rule);
    Task DeleteAlertRuleAsync(AlertRule rule);
    Task<int> CountTanksAsync(int userId);
    Task<int> CountAlertsTodayAsync(int userId);
    Task<double> AverageReadingAsync(int userId, string parameter);
}