using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

// 311 public issue reporting (potholes, sanitation, etc.)
public class ServiceRequest
{
    [Key]
    public Guid RequestId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(100)]
    public string Category { get; set; } = string.Empty; // POTHOLE, SANITATION, LIGHTING

    [MaxLength(1000)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = "OPEN"; // OPEN, IN_PROGRESS, RESOLVED, CLOSED

    // Partitioned by created_at (yearly) — configured in DbContext
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
    public ICollection<ServiceRequestLog> Logs { get; set; } = new List<ServiceRequestLog>();
}
