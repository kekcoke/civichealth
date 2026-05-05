using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;
using CivicApi.Models;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/service-requests")]
public class ServiceRequestsController : ControllerBase
{
    private readonly AppDbContext _db;
    public ServiceRequestsController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/service-requests
    [HttpGet]
    public async Task<IActionResult> GetServiceRequests([FromQuery] Guid? citizenId, [FromQuery] string? status)
    {
        var query = _db.ServiceRequests.AsNoTracking();
        if (citizenId.HasValue) query = query.Where(s => s.CitizenId == citizenId.Value);
        if (!string.IsNullOrWhiteSpace(status)) query = query.Where(s => s.Status == status.ToUpper());
        return Ok(await query.OrderByDescending(s => s.CreatedAt).ToListAsync());
    }

    // POST /api/civic/v1/service-requests
    [HttpPost]
    public async Task<IActionResult> SubmitServiceRequest([FromBody] ServiceRequest request)
    {
        request.RequestId  = Guid.NewGuid();
        request.Status     = "OPEN";
        request.CreatedAt  = DateTime.UtcNow;
        request.UpdatedAt  = DateTime.UtcNow;
        _db.ServiceRequests.Add(request);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetServiceRequests), new { id = request.RequestId }, request);
    }

    // PUT /api/civic/v1/service-requests/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateServiceRequest(Guid id, [FromBody] ServiceRequest updated)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request is null) return NotFound();
        request.Status      = updated.Status;
        request.Description = updated.Description;
        request.UpdatedAt   = DateTime.UtcNow;

        // Append audit log entry
        _db.ServiceRequestLogs.Add(new ServiceRequestLog
        {
            LogId        = Guid.NewGuid(),
            RequestId    = id,
            StatusChange = updated.Status,
            Note         = updated.Description,
            UpdatedBy    = User.Identity?.Name ?? "system",
            CreatedAt    = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return Ok(request);
    }

    // DELETE /api/civic/v1/service-requests/{id}
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> WithdrawServiceRequest(Guid id)
    {
        var request = await _db.ServiceRequests.FindAsync(id);
        if (request is null) return NotFound();
        request.Status    = "CLOSED";
        request.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
