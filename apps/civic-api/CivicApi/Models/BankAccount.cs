using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

public class BankAccount
{
    [Key]
    public Guid BankAccountId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CitizenId { get; set; }

    [Required, MaxLength(100)]
    public string BankName { get; set; } = string.Empty;

    // Encrypted at application level; stored as HMAC-verified ciphertext
    [Required, MaxLength(512)]
    public string AccountNumberEncrypted { get; set; } = string.Empty;

    [Required, MaxLength(512)]
    public string AccountNumberHmac { get; set; } = string.Empty;

    [MaxLength(20)]
    public string AccountType { get; set; } = "CHECKING"; // CHECKING, SAVINGS

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey(nameof(CitizenId))]
    public Citizen Citizen { get; set; } = null!;
}
