using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Controllers;
using CivicApi.Data;
using CivicApi.Models;
using Xunit;
using FluentAssertions;

namespace CivicApi.Tests.Controllers;

public class PermitsControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly PermitsController _controller;

    public PermitsControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new PermitsController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetPermits_ReturnsAll_WhenNoFilters()
    {
        await SeedPermits(3);

        var result = await _controller.GetPermits(null, null);
        result.Should().BeOfType<OkObjectResult>();
        var permits = ((OkObjectResult)result).Value as List<Permit>;
        permits.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetPermits_FiltersByCitizenId()
    {
        var targetCitizen = Guid.NewGuid();
        var otherCitizen = Guid.NewGuid();
        _db.Permits.AddRange(
            CreatePermit(targetCitizen, "PENDING"),
            CreatePermit(otherCitizen, "APPROVED")
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetPermits(targetCitizen, null);
        var permits = ((OkObjectResult)result).Value as List<Permit>;
        permits.Should().HaveCount(1);
        permits!.First().CitizenId.Should().Be(targetCitizen);
    }

    [Fact]
    public async Task GetPermits_FiltersByStatus()
    {
        _db.Permits.AddRange(
            CreatePermit(Guid.NewGuid(), "PENDING"),
            CreatePermit(Guid.NewGuid(), "APPROVED")
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetPermits(null, "PENDING");
        var permits = ((OkObjectResult)result).Value as List<Permit>;
        permits.Should().HaveCount(1);
        permits!.First().Status.Should().Be("PENDING");
    }

    [Fact]
    public async Task ApplyForPermit_ReturnsCreatedWithPendingStatus()
    {
        var permit = new Permit
        {
            CitizenId = Guid.NewGuid(),
            PermitType = "BUILDING"
        };

        var result = await _controller.ApplyForPermit(permit);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = (result as CreatedAtActionResult)!.Value as Permit;
        created!.PermitId.Should().NotBeEmpty();
        created.Status.Should().Be("PENDING");
    }

    private static Permit CreatePermit(Guid citizenId, string status)
    {
        return new Permit
        {
            PermitId = Guid.NewGuid(),
            CitizenId = citizenId,
            PermitType = "BUILDING",
            Status = status,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    private async Task SeedPermits(int count)
    {
        for (int i = 0; i < count; i++)
        {
            _db.Permits.Add(CreatePermit(Guid.NewGuid(), "PENDING"));
        }
        await _db.SaveChangesAsync();
    }
}
