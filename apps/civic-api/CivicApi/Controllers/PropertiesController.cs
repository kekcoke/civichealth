using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1")]
public class PropertiesController : ControllerBase
{
    private readonly AppDbContext _db;
    public PropertiesController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/properties/{id}
    [HttpGet("properties/{id:guid}")]
    public async Task<IActionResult> GetProperty(Guid id)
    {
        var property = await _db.Properties
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PropertyId == id);
        return property is null ? NotFound() : Ok(property);
    }

    // GET /api/civic/v1/assessments
    [HttpGet("assessments")]
    public async Task<IActionResult> GetAssessments([FromQuery] Guid? propertyId, [FromQuery] int? year)
    {
        var query = _db.TaxAssessments.AsNoTracking();
        if (propertyId.HasValue) query = query.Where(a => a.PropertyId == propertyId.Value);
        if (year.HasValue)       query = query.Where(a => a.AssessmentYear == year.Value);
        return Ok(await query.OrderByDescending(a => a.AssessmentYear).ToListAsync());
    }
}
