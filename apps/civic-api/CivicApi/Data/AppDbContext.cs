using Microsoft.EntityFrameworkCore;
using CivicApi.Models;

namespace CivicApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    // DbSets
    public DbSet<Citizen> Citizens => Set<Citizen>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<PaymentBatch> PaymentBatches => Set<PaymentBatch>();
    public DbSet<Property> Properties => Set<Property>();
    public DbSet<TaxAssessment> TaxAssessments => Set<TaxAssessment>();
    public DbSet<Permit> Permits => Set<Permit>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ServiceRequestLog> ServiceRequestLogs => Set<ServiceRequestLog>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<InsurancePolicy> InsurancePolicies => Set<InsurancePolicy>();
    public DbSet<Department> Departments => Set<Department>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ── Citizens ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Citizen>(e =>
        {
            e.HasIndex(c => c.CitizenId);               // B-Tree on PK
            e.HasIndex(c => c.OidcUuid).IsUnique();     // Federated identity lookup
            e.Property(c => c.TaxStatus).HasDefaultValue("CURRENT");
        });

        // ── BankAccounts ──────────────────────────────────────────────────────
        modelBuilder.Entity<BankAccount>(e =>
        {
            e.HasOne(b => b.Citizen)
             .WithMany(c => c.BankAccounts)
             .HasForeignKey(b => b.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Invoices ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Invoice>(e =>
        {
            // Partial index: speeds up collection queries for overdue invoices
            e.HasIndex(i => i.Status)
             .HasFilter("\"Status\" = 'OVERDUE'")
             .HasDatabaseName("IX_Invoices_Status_Overdue");

            e.HasOne(i => i.Citizen)
             .WithMany(c => c.Invoices)
             .HasForeignKey(i => i.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Payments ──────────────────────────────────────────────────────────
        modelBuilder.Entity<Payment>(e =>
        {
            // Composite index for citizen payment history lookups
            e.HasIndex(p => new { p.CitizenId, p.Status })
             .HasDatabaseName("IX_Payments_CitizenId_Status");

            e.HasOne(p => p.Invoice)
             .WithMany(i => i.Payments)
             .HasForeignKey(p => p.InvoiceId)
             .OnDelete(DeleteBehavior.Restrict);

            e.HasOne(p => p.Citizen)
             .WithMany(c => c.Payments)
             .HasForeignKey(p => p.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── PaymentBatches ────────────────────────────────────────────────────
        modelBuilder.Entity<PaymentBatch>(e =>
        {
            e.HasIndex(b => b.SettlementDate)
             .HasDatabaseName("IX_PaymentBatches_SettlementDate");
        });

        // ── Properties ────────────────────────────────────────────────────────
        modelBuilder.Entity<Property>(e =>
        {
            // PostGIS GiST spatial index on boundary_geom
            e.HasIndex(p => p.BoundaryGeom)
             .HasMethod("gist")
             .HasDatabaseName("IX_Properties_BoundaryGeom");

            e.HasOne(p => p.Citizen)
             .WithMany(c => c.Properties)
             .HasForeignKey(p => p.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── TaxAssessments ────────────────────────────────────────────────────
        modelBuilder.Entity<TaxAssessment>(e =>
        {
            // BRIN index for time-series optimization on AssessedAt
            e.HasIndex(t => t.AssessedAt)
             .HasMethod("brin")
             .HasDatabaseName("IX_TaxAssessments_AssessedAt_BRIN");

            e.HasOne(t => t.Property)
             .WithMany(p => p.TaxAssessments)
             .HasForeignKey(t => t.PropertyId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Permits ───────────────────────────────────────────────────────────
        modelBuilder.Entity<Permit>(e =>
        {
            // Composite B-Tree on (citizen_id, permit_type, status)
            e.HasIndex(p => new { p.CitizenId, p.PermitType, p.Status })
             .HasDatabaseName("IX_Permits_CitizenId_Type_Status");

            e.HasOne(p => p.Citizen)
             .WithMany(c => c.Permits)
             .HasForeignKey(p => p.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ServiceRequests ───────────────────────────────────────────────────
        modelBuilder.Entity<ServiceRequest>(e =>
        {
            e.HasOne(s => s.Citizen)
             .WithMany(c => c.ServiceRequests)
             .HasForeignKey(s => s.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── ServiceRequestLogs ────────────────────────────────────────────────
        modelBuilder.Entity<ServiceRequestLog>(e =>
        {
            e.HasIndex(l => l.RequestId)
             .HasDatabaseName("IX_ServiceRequestLogs_RequestId");

            e.HasOne(l => l.ServiceRequest)
             .WithMany(s => s.Logs)
             .HasForeignKey(l => l.RequestId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // ── Notifications ─────────────────────────────────────────────────────
        modelBuilder.Entity<Notification>(e =>
        {
            // BRIN index for time-series on SentAt
            e.HasIndex(n => n.SentAt)
             .HasMethod("brin")
             .HasDatabaseName("IX_Notifications_SentAt_BRIN");

            e.HasOne(n => n.Citizen)
             .WithMany(c => c.Notifications)
             .HasForeignKey(n => n.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── InsurancePolicies ─────────────────────────────────────────────────
        modelBuilder.Entity<InsurancePolicy>(e =>
        {
            // Map Metadata string to JSONB column; GIN index for JSONB querying
            e.Property(i => i.Metadata)
             .HasColumnType("jsonb")
             .HasDefaultValue("{}");

            e.HasIndex(i => i.Metadata)
             .HasMethod("gin")
             .HasDatabaseName("IX_InsurancePolicies_Metadata_GIN");

            e.HasOne(i => i.Citizen)
             .WithMany(c => c.InsurancePolicies)
             .HasForeignKey(i => i.CitizenId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // ── Departments ───────────────────────────────────────────────────────
        modelBuilder.Entity<Department>(e =>
        {
            e.HasIndex(d => d.DepartmentCode)
             .IsUnique()
             .HasDatabaseName("IX_Departments_Code");
        });
    }
}
