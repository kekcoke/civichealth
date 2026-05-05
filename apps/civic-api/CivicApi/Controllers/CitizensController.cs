using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;
using CivicApi.Models;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/citizens")]
public class CitizensController : ControllerBase
{
    private readonly AppDbContext _db;
    public CitizensController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/citizens/{id}
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCitizen(Guid id)
    {
        var citizen = await _db.Citizens
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.CitizenId == id);
        return citizen is null ? NotFound() : Ok(citizen);
    }

    // POST /api/civic/v1/citizens
    [HttpPost]
    public async Task<IActionResult> CreateCitizen([FromBody] Citizen citizen)
    {
        citizen.CitizenId = Guid.NewGuid();
        citizen.CreatedAt = DateTime.UtcNow;
        citizen.UpdatedAt = DateTime.UtcNow;
        _db.Citizens.Add(citizen);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCitizen), new { id = citizen.CitizenId }, citizen);
    }

    // PUT /api/civic/v1/citizens/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCitizen(Guid id, [FromBody] Citizen updated)
    {
        var citizen = await _db.Citizens.FindAsync(id);
        if (citizen is null) return NotFound();
        citizen.FirstName  = updated.FirstName;
        citizen.LastName   = updated.LastName;
        citizen.Email      = updated.Email;
        citizen.Phone      = updated.Phone;
        citizen.TaxStatus  = updated.TaxStatus;
        citizen.UpdatedAt  = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(citizen);
    }

    // GET /api/civic/v1/citizens/{id}/bank-accounts
    [HttpGet("{id:guid}/bank-accounts")]
    public async Task<IActionResult> GetBankAccounts(Guid id)
    {
        var accounts = await _db.BankAccounts
            .AsNoTracking()
            .Where(b => b.CitizenId == id && b.IsActive)
            .ToListAsync();
        return Ok(accounts);
    }

    // POST /api/civic/v1/citizens/{id}/bank-accounts
    [HttpPost("{id:guid}/bank-accounts")]
    public async Task<IActionResult> AddBankAccount(Guid id, [FromBody] BankAccount account)
    {
        if (!await _db.Citizens.AnyAsync(c => c.CitizenId == id)) return NotFound();
        account.BankAccountId = Guid.NewGuid();
        account.CitizenId     = id;
        account.CreatedAt     = DateTime.UtcNow;
        _db.BankAccounts.Add(account);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBankAccounts), new { id }, account);
    }
}
