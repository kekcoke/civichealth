using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class PaymentBatch
{
    [Key]
    public Guid BatchId { get; set; } = Guid.NewGuid();

    // B-Tree index on settlement_date for daily reconciliation
    public DateTime SettlementDate { get; set; }

    [MaxLength(100)]
    public string GatewayProvider { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalAmount { get; set; }

    [MaxLength(50)]
    public string Status { get; set; } = "PENDING"; // PENDING, SETTLED, FAILED

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
