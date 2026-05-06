using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Controllers;
using CivicApi.Data;
using CivicApi.Models;
using Xunit;
using FluentAssertions;

namespace CivicApi.Tests.Controllers;

public class InvoicesControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly InvoicesController _controller;

    public InvoicesControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new InvoicesController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetInvoices_ReturnsAll_WhenNoStatusFilter()
    {
        await SeedInvoices(3);

        var result = await _controller.GetInvoices(null);
        result.Should().BeOfType<OkObjectResult>();
        var invoices = ((OkObjectResult)result).Value as List<Invoice>;
        invoices.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetInvoices_FiltersByStatus()
    {
        _db.Invoices.AddRange(
            CreateInvoice("PENDING"),
            CreateInvoice("PAID"),
            CreateInvoice("OVERDUE")
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetInvoices("PENDING");
        var invoices = ((OkObjectResult)result).Value as List<Invoice>;
        invoices.Should().HaveCount(1);
        invoices!.First().Status.Should().Be("PENDING");
    }

    [Fact]
    public async Task CreateInvoice_ReturnsCreatedWithGeneratedId()
    {
        var invoice = new Invoice
        {
            CitizenId = Guid.NewGuid(),
            Amount = 500m,
            Status = "PENDING",
            DueDate = DateTime.UtcNow.AddDays(30)
        };

        var result = await _controller.CreateInvoice(invoice);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = (result as CreatedAtActionResult)!.Value as Invoice;
        created!.InvoiceId.Should().NotBeEmpty();
        created.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
    }

    [Fact]
    public async Task UpdateInvoice_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.UpdateInvoice(Guid.NewGuid(), new Invoice { Amount = 200m });
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task UpdateInvoice_ReturnsOk_WhenUpdated()
    {
        var invoice = CreateInvoice("PENDING");
        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        var updated = new Invoice
        {
            Amount = 750m,
            Status = "PAID",
            DueDate = DateTime.UtcNow.AddDays(60)
        };
        var result = await _controller.UpdateInvoice(invoice.InvoiceId, updated);

        result.Should().BeOfType<OkObjectResult>();
        var saved = await _db.Invoices.FindAsync(invoice.InvoiceId);
        saved!.Amount.Should().Be(750m);
        saved.Status.Should().Be("PAID");
    }

    private static Invoice CreateInvoice(string status)
    {
        return new Invoice
        {
            InvoiceId = Guid.NewGuid(),
            CitizenId = Guid.NewGuid(),
            Amount = 100m,
            Status = status,
            DueDate = DateTime.UtcNow.AddDays(30),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private async Task SeedInvoices(int count)
    {
        for (int i = 0; i < count; i++)
        {
            _db.Invoices.Add(CreateInvoice("PENDING"));
        }
        await _db.SaveChangesAsync();
    }
}
