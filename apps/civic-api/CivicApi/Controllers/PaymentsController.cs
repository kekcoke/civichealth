using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Data;
using CivicApi.Models;

namespace CivicApi.Controllers;

public record ProcessPaymentRequest(Guid InvoiceId, decimal Amount, string GatewayToken);
public record RefundRequest(string Reason);

[ApiController]
[Route("api/civic/v1/payments")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public PaymentsController(AppDbContext db) => _db = db;

    // GET /api/civic/v1/payments
    [HttpGet]
    public async Task<IActionResult> GetPayments([FromQuery] Guid? citizenId)
    {
        var query = _db.Payments.AsNoTracking();
        if (citizenId.HasValue)
            query = query.Where(p => p.CitizenId == citizenId.Value);
        return Ok(await query.OrderByDescending(p => p.CreatedAt).ToListAsync());
    }

    // POST /api/civic/v1/payments
    [HttpPost]
    public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentRequest req)
    {
        var invoice = await _db.Invoices.FindAsync(req.InvoiceId);
        if (invoice is null) return NotFound(new { error = "Invoice not found." });

        // Advisory lock equivalent: check for in-flight payment to prevent double-billing
        var existing = await _db.Payments.AnyAsync(
            p => p.InvoiceId == req.InvoiceId && p.Status == "PENDING");
        if (existing) return Conflict(new { error = "A payment for this invoice is already in progress." });

        var payment = new Payment
        {
            PaymentId    = Guid.NewGuid(),
            InvoiceId    = req.InvoiceId,
            CitizenId    = invoice.CitizenId,
            Amount       = req.Amount,
            GatewayToken = req.GatewayToken,
            Status       = "COMPLETED",
            ProcessedAt  = DateTime.UtcNow,
            CreatedAt    = DateTime.UtcNow
        };

        // Update invoice status — mirrors trigger_update_tax_status_on_payment
        invoice.Status    = "PAID";
        invoice.UpdatedAt = DateTime.UtcNow;

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetPayments), new { id = payment.PaymentId }, payment);
    }

    // POST /api/civic/v1/payments/{id}/refund
    [HttpPost("{id:guid}/refund")]
    public async Task<IActionResult> RefundPayment(Guid id, [FromBody] RefundRequest req)
    {
        var payment = await _db.Payments.FindAsync(id);
        if (payment is null) return NotFound();
        if (payment.Status != "COMPLETED")
            return BadRequest(new { error = "Only completed payments can be refunded." });
        payment.Status = "REFUNDED";
        await _db.SaveChangesAsync();
        return Ok(payment);
    }
}
