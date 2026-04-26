namespace BioDash.Api.Models;

public class Reading
{
    public int      Id          { get; set; }
    public int      TankId      { get; set; }
    public double   Level       { get; set; }
    public double   Temperature { get; set; }
    public double   Ph          { get; set; }
    public DateTime RecordedAt  { get; set; } = DateTime.UtcNow;

    public Tank Tank { get; set; } = null!;
}