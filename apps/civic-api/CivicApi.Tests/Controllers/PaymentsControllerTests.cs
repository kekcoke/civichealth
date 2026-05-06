using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Controllers;
using CivicApi.Data;
using CivicApi.Models;
using Xunit;
using FluentAssertions;

namespace CivicApi.Tests.Controllers;

public class PaymentsControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly PaymentsController _controller;

    public PaymentsControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new PaymentsController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetPayments_ReturnsAllPayments_WhenNoFilter()
    {
        var citizenId = Guid.NewGuid();
        await SeedInvoiceWithPayment(citizenId, "COMPLETED");
        await SeedInvoiceWithPayment(citizenId, "COMPLETED");

        var result = await _controller.GetPayments(null);
        result.Should().BeOfType<OkObjectResult>();
        var payments = ((OkObjectResult)result).Value as List<Payment>;
        payments.Should().HaveCount(2);
    }

    [Fact]
    public async Task GetPayments_FiltersByCitizenId()
    {
        var targetCitizen = Guid.NewGuid();
        var otherCitizen = Guid.NewGuid();
        await SeedInvoiceWithPayment(targetCitizen, "COMPLETED");
        await SeedInvoiceWithPayment(otherCitizen, "COMPLETED");

        var result = await _controller.GetPayments(targetCitizen);
        var payments = ((OkObjectResult)result).Value as List<Payment>;
        payments.Should().HaveCount(1);
        payments!.First().CitizenId.Should().Be(targetCitizen);
    }

    [Fact]
    public async Task ProcessPayment_ReturnsNotFound_WhenInvoiceNotExists()
    {
        var request = new ProcessPaymentRequest(Guid.NewGuid(), 100m, "tok_test");
        var result = await _controller.ProcessPayment(request);
        result.Should().BeOfType<NotFoundObjectResult>();
    }

    [Fact]
    public async Task ProcessPayment_ReturnsCreated_WhenSuccessful()
    {
        var invoice = await SeedInvoice();
        var request = new ProcessPaymentRequest(invoice.InvoiceId, 100m, "tok_test");

        var result = await _controller.ProcessPayment(request);

        result.Should().BeOfType<CreatedAtActionResult>();
        var payment = (result as CreatedAtActionResult)!.Value as Payment;
        payment.Should().NotBeNull();
        payment!.Status.Should().Be("COMPLETED");

        var updatedInvoice = await _db.Invoices.FindAsync(invoice.InvoiceId);
        updatedInvoice!.Status.Should().Be("PAID");
    }

    [Fact]
    public async Task ProcessPayment_ReturnsConflict_WhenPendingPaymentExists()
    {
        var invoice = await SeedInvoice();
        // Create a pending payment
        _db.Payments.Add(new Payment
        {
            PaymentId = Guid.NewGuid(),
            InvoiceId = invoice.InvoiceId,
            CitizenId = invoice.CitizenId,
            Amount = 50m,
            Status = "PENDING",
            GatewayToken = "tok_pending"
        });
        await _db.SaveChangesAsync();

        var request = new ProcessPaymentRequest(invoice.InvoiceId, 100m, "tok_new");
        var result = await _controller.ProcessPayment(request);

        result.Should().BeOfType<ConflictObjectResult>();
    }

    [Fact]
    public async Task RefundPayment_ReturnsNotFound_WhenPaymentNotExists()
    {
        var result = await _controller.RefundPayment(Guid.NewGuid(), new RefundRequest("Test"));
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task RefundPayment_ReturnsBadRequest_WhenNotCompleted()
    {
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            InvoiceId = Guid.NewGuid(),
            CitizenId = Guid.NewGuid(),
            Amount = 100m,
            Status = "PENDING"
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        var result = await _controller.RefundPayment(payment.PaymentId, new RefundRequest("Test"));
        result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task RefundPayment_ReturnsOk_WhenCompleted()
    {
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            InvoiceId = Guid.NewGuid(),
            CitizenId = Guid.NewGuid(),
            Amount = 100m,
            Status = "COMPLETED"
        };
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();

        var result = await _controller.RefundPayment(payment.PaymentId, new RefundRequest("Customer request"));

        result.Should().BeOfType<OkObjectResult>();
        var refunded = (result as OkObjectResult)!.Value as Payment;
        refunded!.Status.Should().Be("REFUNDED");
    }

    private async Task<Invoice> SeedInvoice()
    {
        var citizenId = Guid.NewGuid();
        var invoice = new Invoice
        {
            InvoiceId = Guid.NewGuid(),
            CitizenId = citizenId,
            Amount = 100m,
            Status = "PENDING",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        _db.Citizens.Add(new Citizen { CitizenId = citizenId, FirstName = "Test", LastName = "User", TaxStatus = "CURRENT" });
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();
        return invoice;
    }

    private async Task SeedInvoiceWithPayment(Guid citizenId, string paymentStatus)
    {
        var invoice = new Invoice
        {
            InvoiceId = Guid.NewGuid(),
            CitizenId = citizenId,
            Amount = 100m,
            Status = paymentStatus == "COMPLETED" ? "PAID" : "PENDING"
        };
        var payment = new Payment
        {
            PaymentId = Guid.NewGuid(),
            InvoiceId = invoice.InvoiceId,
            CitizenId = citizenId,
            Amount = 100m,
            Status = paymentStatus,
            GatewayToken = "tok_test"
        };
        _db.Invoices.Add(invoice);
        _db.Payments.Add(payment);
        await _db.SaveChangesAsync();
    }
}
