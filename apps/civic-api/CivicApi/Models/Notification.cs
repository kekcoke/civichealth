using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

// Audit trail of all outbound SMS/Email/Push messages to citizens
public class Notification
{
    [Key]
    public Guid NotificationId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(20)]
    public string Channel { get; set; } = string.Empty; // SMS, EMAIL, PUSH

    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Body { get; set; } = string.Empty;

    [MaxLength(50)]
    public string Status { get; set; } = "SENT"; // SENT, DELIVERED, FAILED

    // BRIN index for time-series optimization — configured in DbContext
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
}
