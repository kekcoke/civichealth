using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;
using CivicApi.Models;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/permits")]
public class PermitsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PermitsController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/permits
    [HttpGet]
    public async Task<IActionResult> GetPermits([FromQuery] Guid? citizenId, [FromQuery] string? status)
    {
        var query = _db.Permits.AsNoTracking();
        if (citizenId.HasValue) query = query.Where(p => p.CitizenId == citizenId.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(p => p.Status == status.ToUpper());
        return Ok(await query.OrderByDescending(p => p.CreatedAt).ToListAsync());
    }

    // POST /api/civic/v1/permits
    [HttpPost]
    public async Task<IActionResult> ApplyForPermit([FromBody] Permit permit)
    {
        permit.PermitId   = Guid.NewGuid();
        permit.Status     = "PENDING";
        permit.CreatedAt  = DateTime.UtcNow;
        permit.UpdatedAt  = DateTime.UtcNow;
        _db.Permits.Add(permit);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPermits), new { id = permit.PermitId }, permit);
    }
}
