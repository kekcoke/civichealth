using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Controllers;
using CivicApi.Data;
using CivicApi.Models;
using Xunit;
using FluentAssertions;
using System.Security.Claims;

namespace CivicApi.Tests.Controllers;

public class ServiceRequestsControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly ServiceRequestsController _controller;

    public ServiceRequestsControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new ServiceRequestsController(_db);
        
        // Set up mock HttpContext for User.Identity
        var httpContext = new DefaultHttpContext();
        httpContext.User = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, "test-user")
        }));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = httpContext
        };
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetServiceRequests_ReturnsAll_WhenNoFilters()
    {
        await SeedServiceRequests(3);

        var result = await _controller.GetServiceRequests(null, null);
        result.Should().BeOfType<OkObjectResult>();
        var requests = ((OkObjectResult)result).Value as List<ServiceRequest>;
        requests.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetServiceRequests_FiltersByCitizenId()
    {
        var targetCitizen = Guid.NewGuid();
        var otherCitizen = Guid.NewGuid();
        _db.ServiceRequests.AddRange(
            CreateServiceRequest(targetCitizen, "OPEN"),
            CreateServiceRequest(otherCitizen, "OPEN")
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetServiceRequests(targetCitizen, null);
        var requests = ((OkObjectResult)result).Value as List<ServiceRequest>;
        requests.Should().HaveCount(1);
        requests!.First().CitizenId.Should().Be(targetCitizen);
    }

    [Fact]
    public async Task GetServiceRequests_FiltersByStatus()
    {
        _db.ServiceRequests.AddRange(
            CreateServiceRequest(Guid.NewGuid(), "OPEN"),
            CreateServiceRequest(Guid.NewGuid(), "CLOSED")
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetServiceRequests(null, "OPEN");
        var requests = ((OkObjectResult)result).Value as List<ServiceRequest>;
        requests.Should().HaveCount(1);
        requests!.First().Status.Should().Be("OPEN");
    }

    [Fact]
    public async Task SubmitServiceRequest_ReturnsCreatedWithOpenStatus()
    {
        var request = new ServiceRequest
        {
            CitizenId = Guid.NewGuid(),
            Description = "Street light broken",
            Category = "INFRASTRUCTURE"
        };

        var result = await _controller.SubmitServiceRequest(request);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = (result as CreatedAtActionResult)!.Value as ServiceRequest;
        created!.RequestId.Should().NotBeEmpty();
        created.Status.Should().Be("OPEN");
    }

    [Fact]
    public async Task UpdateServiceRequest_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.UpdateServiceRequest(Guid.NewGuid(), new ServiceRequest { Status = "RESOLVED" });
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task UpdateServiceRequest_CreatesAuditLogEntry()
    {
        var serviceRequest = CreateServiceRequest(Guid.NewGuid(), "OPEN");
        _db.ServiceRequests.Add(serviceRequest);
        await _db.SaveChangesAsync();

        var updated = new ServiceRequest { Status = "IN_PROGRESS", Description = "Working on it" };
        var result = await _controller.UpdateServiceRequest(serviceRequest.RequestId, updated);

        result.Should().BeOfType<OkObjectResult>();
        var logEntry = await _db.ServiceRequestLogs.FirstOrDefaultAsync(l => l.RequestId == serviceRequest.RequestId);
        logEntry.Should().NotBeNull();
        logEntry!.StatusChange.Should().Be("IN_PROGRESS");
    }

    [Fact]
    public async Task WithdrawServiceRequest_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.WithdrawServiceRequest(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task WithdrawServiceRequest_SoftDeletesBySettingStatusToClosed()
    {
        var serviceRequest = CreateServiceRequest(Guid.NewGuid(), "OPEN");
        _db.ServiceRequests.Add(serviceRequest);
        await _db.SaveChangesAsync();

        var result = await _controller.WithdrawServiceRequest(serviceRequest.RequestId);

        result.Should().BeOfType<NoContentResult>();
        var updated = await _db.ServiceRequests.FindAsync(serviceRequest.RequestId);
        updated!.Status.Should().Be("CLOSED");
    }

    [Fact]
    public async Task WithdrawServiceRequest_DoesNotDeleteRecord()
    {
        var serviceRequest = CreateServiceRequest(Guid.NewGuid(), "OPEN");
        _db.ServiceRequests.Add(serviceRequest);
        await _db.SaveChangesAsync();

        await _controller.WithdrawServiceRequest(serviceRequest.RequestId);

        var exists = await _db.ServiceRequests.AnyAsync(s => s.RequestId == serviceRequest.RequestId);
        exists.Should().BeTrue();
    }

    private static ServiceRequest CreateServiceRequest(Guid citizenId, string status)
    {
        return new ServiceRequest
        {
            RequestId = Guid.NewGuid(),
            CitizenId = citizenId,
            Category = "GENERAL",
            Description = "Test request",
            Status = status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private async Task SeedServiceRequests(int count)
    {
        for (int i = 0; i < count; i++)
        {
            _db.ServiceRequests.Add(CreateServiceRequest(Guid.NewGuid(), "OPEN"));
        }
        await _db.SaveChangesAsync();
    }
}
