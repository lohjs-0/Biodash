namespace BioDash.Api.Models;

public class AlertRule
{
    public int    Id        { get; set; }
    public int    TankId    { get; set; }
    public string Parameter { get; set; } = string.Empty;
    public double MinValue  { get; set; }
    public double MaxValue  { get; set; }
    public bool   IsActive  { get; set; } = true;

    public Tank Tank { get; set; } = null!;
}