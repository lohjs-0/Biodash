using System.ComponentModel.DataAnnotations;

namespace BioDash.Api.DTOs;

// ── Responses ─────────────────────────────────────────────────────────────────

public record TankDto(
    int      Id,
    string   Name,
    string   Description,
    double   VolumeLiters,
    double   CurrentLevel,
    double   CurrentTemperature,
    double   CurrentPh,
    bool     IsOnline,
    bool     AlertActive,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record ReadingDto(
    int      Id,
    int      TankId,
    double   Level,
    double   Temperature,
    double   Ph,
    DateTime RecordedAt
);

public record ReadingHistoryDto(
    double AvgLevel,
    double AvgTemperature,
    double AvgPh,
    double MaxTemperature,
    double MinTemperature,
    double MaxPh,
    double MinPh,
    int    TotalReadings
);

public record AlertRuleDto(
    int    Id,
    int    TankId,
    string Parameter,
    double MinValue,
    double MaxValue,
    bool   IsActive
);

public record UserMetricsDto(
    int    TotalTanks,
    int    OnlineTanks,
    int    AlertsToday,
    double AvgTemperature,
    double AvgPh,
    double AvgLevel
);

// ── Requests ──────────────────────────────────────────────────────────────────

public record CreateTankRequest(
    [Required, MinLength(2), MaxLength(100)]
    string Name,

    [MaxLength(500)]
    string Description,

    [Range(0.1, 100_000)]
    double VolumeLiters
);

public record UpdateTankRequest(
    [Required, MinLength(2), MaxLength(100)]
    string Name,

    [MaxLength(500)]
    string Description,

    [Range(0.1, 100_000)]
    double VolumeLiters
);

public record CreateAlertRuleRequest(
    [Required, MaxLength(50)]
    string Parameter,

    double MinValue,
    double MaxValue
);

public record UpdateAlertRuleRequest(
    double MinValue,
    double MaxValue
);