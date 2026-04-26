using BioDash.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace BioDash.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User>      Users      => Set<User>();
    public DbSet<Tank>      Tanks      => Set<Tank>();
    public DbSet<Reading>   Readings   => Set<Reading>();
    public DbSet<AlertRule> AlertRules => Set<AlertRule>();
    public DbSet<AlertLog>  AlertLogs  => Set<AlertLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // User
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .HasMaxLength(200);

        modelBuilder.Entity<User>()
            .Property(u => u.Name)
            .HasMaxLength(100);

        // Tank
        modelBuilder.Entity<Tank>()
            .HasOne(t => t.User)
            .WithMany(u => u.Tanks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Tank>()
            .Property(t => t.Name)
            .HasMaxLength(100);

        // Reading — índice composto para queries por tank + período
        modelBuilder.Entity<Reading>()
            .HasIndex(r => new { r.TankId, r.RecordedAt });

        // AlertRule
        modelBuilder.Entity<AlertRule>()
            .HasOne(a => a.Tank)
            .WithMany(t => t.AlertRules)
            .HasForeignKey(a => a.TankId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AlertRule>()
            .Property(a => a.Parameter)
            .HasMaxLength(50);

        // AlertLog
        modelBuilder.Entity<AlertLog>()
            .HasOne(a => a.Tank)
            .WithMany()
            .HasForeignKey(a => a.TankId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AlertLog>()
            .HasIndex(a => new { a.TankId, a.TriggeredAt });

        modelBuilder.Entity<AlertLog>()
            .Property(a => a.Parameter)
            .HasMaxLength(50);
    }
}