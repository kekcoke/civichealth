using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace CivicApi.Models;

public class Property
{
    [Key]
    public Guid PropertyId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(255)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(50)]
    public string ZoningCode { get; set; } = string.Empty; // RESIDENTIAL, COMMERCIAL, INDUSTRIAL

    // PostGIS GiST index on boundary_geom — type mapped in DbContext
    public Geometry? BoundaryGeom { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LotAreaSqm { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
    public ICollection<TaxAssessment> TaxAssessments { get; set; } = new List<TaxAssessment>();
    public ICollection<Permit> Permits { get; set; } = new List<Permit>();
}
