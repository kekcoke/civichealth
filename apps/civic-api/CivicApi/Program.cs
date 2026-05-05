using Microsoft.EntityFrameworkCore;
using CivicApi.Data;

var builder = WebApplication.CreateBuilder(args);

// ── Database: PostgreSQL + EF Core + NetTopologySuite (PostGIS) ───────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("CivicDb"),
        npgsql => npgsql.UseNetTopologySuite()   // Enables PostGIS geometry support
    )
);

// ── Services ──────────────────────────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────────────────────
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
