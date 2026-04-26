namespace BioDash.Api.Models;

public class Tank
{
    public int      Id           { get; set; }
    public int      UserId       { get; set; }
    public string   Name         { get; set; } = string.Empty;
    public string   Description  { get; set; } = string.Empty;
    public double   VolumeLiters { get; set; }
    public bool     IsOnline     { get; set; } = true;
    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt   { get; set; }

    public User                    User       { get; set; } = null!;
    public ICollection<Reading>    Readings   { get; set; } = [];
    public ICollection<AlertRule>  AlertRules { get; set; } = [];
}