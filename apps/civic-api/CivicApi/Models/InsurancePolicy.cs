using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

// Public-sector healthcare coverage and government subsidies
public class InsurancePolicy
{
    [Key]
    public Guid PolicyId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(100)]
    public string PolicyNumber { get; set; } = string.Empty;

    [MaxLength(100)]
    public string Provider { get; set; } = string.Empty;

    [MaxLength(50)]
    public string PolicyType { get; set; } = string.Empty; // HEALTH, SUBSIDY, PHILHEALTH

    // GIN index on Metadata for JSONB policy details — configured in DbContext
    public string Metadata { get; set; } = "{}"; // JSONB in PostgreSQL

    public DateTime EffectiveDate { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
}
