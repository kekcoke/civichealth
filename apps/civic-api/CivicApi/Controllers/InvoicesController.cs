using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;
using CivicApi.Models;

namespace CivicApi.Controllers;

[ApiController]
[Route("api/civic/v1/invoices")]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _db;
    public InvoicesController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/invoices?status={status}
    [HttpGet]
    public async Task<IActionResult> GetInvoices([FromQuery] string? status)
    {
        var query = _db.Invoices.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(i => i.Status == status.ToUpper());
        return Ok(await query.OrderByDescending(i => i.CreatedAt).ToListAsync());
    }

    // POST /api/civic/v1/invoices
    [HttpPost]
    public async Task<IActionResult> CreateInvoice([FromBody] Invoice invoice)
    {
        invoice.InvoiceId  = Guid.NewGuid();
        invoice.CreatedAt  = DateTime.UtcNow;
        invoice.UpdatedAt  = DateTime.UtcNow;
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetInvoices), new { id = invoice.InvoiceId }, invoice);
    }

    // PUT /api/civic/v1/invoices/{id}
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateInvoice(Guid id, [FromBody] Invoice updated)
    {
        var invoice = await _db.Invoices.FindAsync(id);
        if (invoice is null) return NotFound();
        invoice.Amount    = updated.Amount;
        invoice.Status    = updated.Status;
        invoice.DueDate   = updated.DueDate;
        invoice.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return Ok(invoice);
    }
}
