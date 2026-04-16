using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public DbSet<Producto> Productos { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}