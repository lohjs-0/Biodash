namespace BioDash.Api.Models;

public class AlertLog
{
    public int      Id          { get; set; }
    public int      TankId      { get; set; }
    public string   Parameter   { get; set; } = string.Empty;
    public double   Value       { get; set; }
    public double   MinValue    { get; set; }
    public double   MaxValue    { get; set; }
    public DateTime TriggeredAt { get; set; } = DateTime.UtcNow;
    public bool     Resolved    { get; set; } = false;
    public DateTime? ResolvedAt { get; set; }

    public Tank Tank { get; set; } = null!;
}