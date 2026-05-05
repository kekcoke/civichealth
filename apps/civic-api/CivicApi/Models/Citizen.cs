using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using NetTopologySuite.Geometries;

namespace CivicApi.Models;

public class Citizen
{
    [Key]
    public Guid CitizenId { get; set; } = Guid.NewGuid();

    // Federated identity from Keycloak OIDC broker
    [Required]
    public Guid OidcUuid { get; set; }

    [Required, MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(50)]
    public string TaxStatus { get; set; } = "CURRENT"; // CURRENT, OVERDUE, EXEMPT

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<BankAccount> BankAccounts { get; set; } = new List<BankAccount>();
    public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public ICollection<Property> Properties { get; set; } = new List<Property>();
    public ICollection<Permit> Permits { get; set; } = new List<Permit>();
    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public ICollection<InsurancePolicy> InsurancePolicies { get; set; } = new List<InsurancePolicy>();
}
