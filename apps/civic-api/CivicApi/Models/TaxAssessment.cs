using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class TaxAssessment
{
    [Key]
    public Guid AssessmentId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid PropertyId { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal AssessedValue { get; set; }

    [Column(TypeName = "decimal(5,4)")]
    public decimal TaxRate { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal TaxDue { get; set; }

    public int AssessmentYear { get; set; }

    // BRIN index for time-series optimization — configured in DbContext
    public DateTime AssessedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(PropertyId))]
    public Property Property { get; set; } = null!;
}
