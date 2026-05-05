using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class Permit
{
    [Key]
    public Guid PermitId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    public Guid? PropertyId { get; set; }

    [Required, MaxLength(50)]
    public string PermitType { get; set; } = string.Empty; // BUILDING, BUSINESS, EVENT

    [MaxLength(50)]
    public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED, EXPIRED

    public DateTime? IssuedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;

    [ForeignKey(nameof(PropertyId))]
    public Property? Property { get; set; }
}
