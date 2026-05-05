using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    public NotificationsController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/notifications
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] Guid? citizenId)
    {
        var query = _db.Notifications.AsNoTracking();
        if (citizenId.HasValue) query = query.Where(n => n.CitizenId == citizenId.Value);
        return Ok(await query.OrderByDescending(n => n.SentAt).ToListAsync());
    }
}
