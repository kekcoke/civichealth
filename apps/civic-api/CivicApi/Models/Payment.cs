using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class Payment
{
    [Key]
    public Guid PaymentId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid InvoiceId { get; set; }

    [Required]
    public Guid CitizenId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "PENDING"; // PENDING, COMPLETED, REFUNDED, FAILED

    // Third-party payment gateway token reference
    [MaxLength(255)]
    public string GatewayToken { get; set; } = string.Empty;

    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(InvoiceId))]
    public Invoice Invoice { get; set; } = null!;

    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;

    public Guid? PaymentBatchId { get; set; }

    [ForeignKey(nameof(PaymentBatchId))]
    public PaymentBatch? PaymentBatch { get; set; }
}
