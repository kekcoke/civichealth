using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/insurance-policies")]
public class InsurancePoliciesController : ControllerBase
{
    private readonly AppDbContext _db;
    public InsurancePoliciesController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/insurance-policies
    [HttpGet]
    public async Task<IActionResult> GetInsurancePolicies([FromQuery] Guid? citizenId)
    {
        var query = _db.InsurancePolicies.AsNoTracking().Where(p => p.IsActive);
        if (citizenId.HasValue) query = query.Where(p => p.CitizenId == citizenId.Value);
        return Ok(await query.OrderByDescending(p => p.EffectiveDate).ToListAsync());
    }
}
