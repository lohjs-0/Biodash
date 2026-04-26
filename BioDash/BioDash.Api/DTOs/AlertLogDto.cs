namespace BioDash.Api.DTOs;

public record AlertLogDto(
    int       Id,
    int       TankId,
    string    TankName,
    string    Parameter,
    double    Value,
    double    MinValue,
    double    MaxValue,
    DateTime  TriggeredAt,
    bool      Resolved,
    DateTime? ResolvedAt
);