using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CivicApi.Controllers;
using CivicApi.Data;
using CivicApi.Models;
using Xunit;
using FluentAssertions;

namespace CivicApi.Tests.Controllers;

public class CitizensControllerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly CitizensController _controller;

    public CitizensControllerTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _controller = new CitizensController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
    }

    [Fact]
    public async Task GetCitizen_ReturnsNotFound_WhenCitizenDoesNotExist()
    {
        var result = await _controller.GetCitizen(Guid.NewGuid());
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetCitizen_ReturnsOk_WhenCitizenExists()
    {
        var citizen = new Citizen
        {
            CitizenId = Guid.NewGuid(),
            OidcUuid = Guid.NewGuid(),
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            TaxStatus = "CURRENT"
        };
        _db.Citizens.Add(citizen);
        await _db.SaveChangesAsync();

        var result = await _controller.GetCitizen(citizen.CitizenId);

        result.Should().BeOfType<OkObjectResult>();
        var okResult = (OkObjectResult)result;
        var returned = okResult.Value as Citizen;
        returned!.FirstName.Should().Be("Jane");
    }

    [Fact]
    public async Task CreateCitizen_ReturnsCreatedAtAction()
    {
        var citizen = new Citizen
        {
            OidcUuid = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Smith",
            Email = "john@example.com",
            TaxStatus = "CURRENT"
        };

        var result = await _controller.CreateCitizen(citizen);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = (CreatedAtActionResult)result;
        created.Value.Should().BeOfType<Citizen>();
        var createdCitizen = created.Value as Citizen;
        createdCitizen!.CitizenId.Should().NotBeEmpty();
    }

    [Fact]
    public async Task UpdateCitizen_ReturnsNotFound_WhenNotExists()
    {
        var result = await _controller.UpdateCitizen(Guid.NewGuid(), new Citizen { FirstName = "Test", OidcUuid = Guid.NewGuid() });
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task UpdateCitizen_ReturnsOk_WhenUpdated()
    {
        var citizen = new Citizen
        {
            CitizenId = Guid.NewGuid(),
            OidcUuid = Guid.NewGuid(),
            FirstName = "Original",
            LastName = "Name",
            Email = "orig@example.com",
            TaxStatus = "CURRENT"
        };
        _db.Citizens.Add(citizen);
        await _db.SaveChangesAsync();

        var updated = new Citizen { FirstName = "Updated", LastName = "Name", Email = "upd@example.com", TaxStatus = "OVERDUE", OidcUuid = citizen.OidcUuid };
        var result = await _controller.UpdateCitizen(citizen.CitizenId, updated);

        result.Should().BeOfType<OkObjectResult>();
        var saved = await _db.Citizens.FindAsync(citizen.CitizenId);
        saved!.FirstName.Should().Be("Updated");
        saved.TaxStatus.Should().Be("OVERDUE");
    }

    [Fact]
    public async Task GetBankAccounts_ReturnsEmptyList_WhenNoAccounts()
    {
        var citizenId = Guid.NewGuid();
        var result = await _controller.GetBankAccounts(citizenId);
        result.Should().BeOfType<OkObjectResult>();
        var accounts = ((OkObjectResult)result).Value as List<BankAccount>;
        accounts.Should().BeEmpty();
    }

    [Fact]
    public async Task GetBankAccounts_ReturnsOnlyActiveAccounts()
    {
        var citizenId = Guid.NewGuid();
        _db.Citizens.Add(new Citizen { CitizenId = citizenId, OidcUuid = Guid.NewGuid(), FirstName = "Test", LastName = "User", TaxStatus = "CURRENT" });
        _db.BankAccounts.AddRange(
            new BankAccount { BankAccountId = Guid.NewGuid(), CitizenId = citizenId, IsActive = true, BankName = "BDO", AccountNumberEncrypted = "enc1", AccountNumberHmac = "hmac1" },
            new BankAccount { BankAccountId = Guid.NewGuid(), CitizenId = citizenId, IsActive = false, BankName = "BPI", AccountNumberEncrypted = "enc2", AccountNumberHmac = "hmac2" }
        );
        await _db.SaveChangesAsync();

        var result = await _controller.GetBankAccounts(citizenId);
        var accounts = ((OkObjectResult)result).Value as List<BankAccount>;
        accounts.Should().HaveCount(1);
        accounts!.First().BankName.Should().Be("BDO");
    }

    [Fact]
    public async Task AddBankAccount_ReturnsNotFound_WhenCitizenNotExists()
    {
        var account = new BankAccount { BankName = "Test Bank", AccountNumberEncrypted = "enc", AccountNumberHmac = "hmac" };
        var result = await _controller.AddBankAccount(Guid.NewGuid(), account);
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task AddBankAccount_ReturnsCreated_WhenSuccessful()
    {
        var citizenId = Guid.NewGuid();
        _db.Citizens.Add(new Citizen { CitizenId = citizenId, OidcUuid = Guid.NewGuid(), FirstName = "Test", LastName = "User", TaxStatus = "CURRENT" });
        await _db.SaveChangesAsync();

        var account = new BankAccount { BankName = "Test Bank", AccountNumberEncrypted = "enc123", AccountNumberHmac = "hmac123" };
        var result = await _controller.AddBankAccount(citizenId, account);

        result.Should().BeOfType<CreatedAtActionResult>();
        var created = (CreatedAtActionResult)result;
        (created.Value as BankAccount)!.BankAccountId.Should().NotBeEmpty();
    }
}
