using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

// Audit trail of LGU updates and responses on service requests
public class ServiceRequestLog
{
    [Key]
    public Guid LogId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid RequestId { get; set; }

    [MaxLength(50)]
    public string StatusChange { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string Note { get; set; } = string.Empty;

    [MaxLength(255)]
    public string UpdatedBy { get; set; } = string.Empty; // LGU staff identifier

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(RequestId))]
    public ServiceRequest ServiceRequest { get; set; } = null!;
}
