using CivicApi.Models;

namespace CivicApi.Data;

/// <summary>
/// Seed data for local development and integration testing.
/// All users share the same password: DevP@ssw0rd!2026 (managed in Keycloak)
/// </summary>
public static class SeedData
{
    public static void SeedCitizens(AppDbContext context)
    {
        // Only seed if no citizens exist
        if (context.Citizens.Any())
            return;

        Console.WriteLine("🌱 Seeding CivicApi database...");

        var citizens = new List<Citizen>
        {
            // Local Residents (have both CivicApi and HA-BFF records)
            new()
            {
                CitizenId = Guid.NewGuid(),
                OidcUuid = Guid.Parse("07c70a5f-75de-43d9-8eb8-d9891f67dbf2"),
                FirstName = "Maria",
                LastName = "Santos",
                Email = "maria.santos@civichealth.local",
                Phone = "+1-555-0101",
                TaxStatus = "CURRENT"
            },
            new()
            {
                CitizenId = Guid.NewGuid(),
                OidcUuid = Guid.Parse("a214faa7-f476-458e-86bb-82d8923a8183"),
                FirstName = "Juan",
                LastName = "Cruz",
                Email = "juan.cruz@civichealth.local",
                Phone = "+1-555-0102",
                TaxStatus = "CURRENT"
            },
            new()
            {
                CitizenId = Guid.NewGuid(),
                OidcUuid = Guid.Parse("814f0582-2660-4331-8de6-6b5efb4741e9"),
                FirstName = "Elena",
                LastName = "Reyes",
                Email = "elena.reyes@civichealth.local",
                Phone = "+1-555-0103",
                TaxStatus = "OVERDUE" // Has overdue taxes
            }
        };

        context.Citizens.AddRange(citizens);
        context.SaveChanges();

        Console.WriteLine($"  ✓ Created {citizens.Count} local resident citizens");

        // Seed Departments
        var departments = new List<Department>
        {
            new()
            {
                DepartmentId = Guid.NewGuid(),
                DepartmentCode = "LGU-ADMIN",
                Name = "LGU Administration",
                Description = "Local Government Unit administrative functions",
                HeadOfficerName = "Mayor Ramon Reyes",
                ContactEmail = "admin@lgucivichealth.local",
                IsActive = true
            },
            new()
            {
                DepartmentId = Guid.NewGuid(),
                DepartmentCode = "ZONING",
                Name = "Zoning and Land Use",
                Description = "Property zoning and land use management",
                HeadOfficerName = "Engr. Carlos Mendoza",
                ContactEmail = "zoning@lgucivichealth.local",
                IsActive = true
            },
            new()
            {
                DepartmentId = Guid.NewGuid(),
                DepartmentCode = "TREASURY",
                Name = "City Treasury",
                Description = "Tax collection and financial management",
                HeadOfficerName = "Atty. Maria Santos",
                ContactEmail = "treasury@lgucivichealth.local",
                IsActive = true
            },
            new()
            {
                DepartmentId = Guid.NewGuid(),
                DepartmentCode = "HEALTH",
                Name = "Public Health Services",
                Description = "Health permits and sanitation",
                HeadOfficerName = "Dr. Elena Reyes",
                ContactEmail = "health@lgucivichealth.local",
                IsActive = true
            }
        };

        context.Departments.AddRange(departments);
        context.SaveChanges();

        Console.WriteLine($"  ✓ Created {departments.Count} departments");

        // Seed sample Properties for residents
        var maria = context.Citizens.First(c => c.OidcUuid == Guid.Parse("07c70a5f-75de-43d9-8eb8-d9891f67dbf2"));
        var juan = context.Citizens.First(c => c.OidcUuid == Guid.Parse("a214faa7-f476-458e-86bb-82d8923a8183"));
        var elena = context.Citizens.First(c => c.OidcUuid == Guid.Parse("814f0582-2660-4331-8de6-6b5efb4741e9"));

        var properties = new List<Property>
        {
            new()
            {
                PropertyId = Guid.NewGuid(),
                CitizenId = maria.CitizenId,
                Address = "123 Barangay Central, Quezon City",
                ZoningCode = "R1-A",
                LotAreaSqm = 500.00m
            },
            new()
            {
                PropertyId = Guid.NewGuid(),
                CitizenId = juan.CitizenId,
                Address = "456 Barangay Mahogany, Quezon City",
                ZoningCode = "R1-B",
                LotAreaSqm = 350.00m
            },
            new()
            {
                PropertyId = Guid.NewGuid(),
                CitizenId = elena.CitizenId,
                Address = "789 Barangay Sunflower, Quezon City",
                ZoningCode = "R2",
                LotAreaSqm = 280.00m
            }
        };

        context.Properties.AddRange(properties);
        context.SaveChanges();

        Console.WriteLine($"  ✓ Created {properties.Count} properties with tax assessments");

        // Seed sample Tax Assessments
        var assessments = properties.Select(p => new TaxAssessment
        {
            AssessmentId = Guid.NewGuid(),
            PropertyId = p.PropertyId,
            AssessedValue = p.LotAreaSqm * 5000m, // ₱5,000 per sqm base value
            TaxRate = 0.0125m, // 1.25% annual tax
            TaxDue = p.LotAreaSqm * 5000m * 0.0125m,
            AssessmentYear = DateTime.UtcNow.Year,
            AssessedAt = DateTime.UtcNow
        }).ToList();

        context.TaxAssessments.AddRange(assessments);
        context.SaveChanges();

        Console.WriteLine($"  ✓ Created {assessments.Count} tax assessments");

        // Seed sample Invoices
        var invoices = new List<Invoice>
        {
            new()
            {
                InvoiceId = Guid.NewGuid(),
                CitizenId = juan.CitizenId,
                InvoiceType = "PROPERTY_TAX",
                Amount = assessments.First(a => a.PropertyId == properties[1].PropertyId).TaxDue,
                Status = "PENDING",
                DueDate = DateTime.UtcNow.AddDays(30)
            },
            new()
            {
                InvoiceId = Guid.NewGuid(),
                CitizenId = elena.CitizenId,
                InvoiceType = "PROPERTY_TAX",
                Amount = assessments.First(a => a.PropertyId == properties[2].PropertyId).TaxDue,
                Status = "OVERDUE",
                DueDate = DateTime.UtcNow.AddDays(-60)
            }
        };

        context.Invoices.AddRange(invoices);
        context.SaveChanges();

        Console.WriteLine($"  ✓ Created {invoices.Count} invoices");

        Console.WriteLine("✅ CivicApi seed completed!");
        Console.WriteLine("");
        Console.WriteLine("📋 Test Users (CivicApi):");
        Console.WriteLine("  Password for all: DevP@ssw0rd!2026 (managed in Keycloak)");
        Console.WriteLine("");
        Console.WriteLine("  Local Residents (have Civic + HA access):");
        Console.WriteLine("    - Maria Santos (admin)     maria.santos@civichealth.local  [TaxStatus: CURRENT]");
        Console.WriteLine("    - Juan Cruz                juan.cruz@civichealth.local     [TaxStatus: CURRENT]");
        Console.WriteLine("    - Elena Reyes             elena.reyes@civichealth.local  [TaxStatus: OVERDUE]");
    }
}
