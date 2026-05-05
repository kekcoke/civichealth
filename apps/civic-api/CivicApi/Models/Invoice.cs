using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class Invoice
{
    [Key]
    public Guid InvoiceId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(50)]
    public string InvoiceType { get; set; } = string.Empty; // TAX, UTILITY, PERMIT

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "PENDING"; // PENDING, PAID, OVERDUE, CANCELLED

    public DateTime DueDate { get; set; }

    // Partitioned by created_at (monthly) — handled at DB level
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
