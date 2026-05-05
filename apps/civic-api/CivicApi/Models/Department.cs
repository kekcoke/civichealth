using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CivicApi.Models;

// City departments and civic staff directory
public class Department
{
    [Key]
    public Guid DepartmentId { get; set; } = Guid.NewGuid();

    [Required, MaxLength(50)]
    public string DepartmentCode { get; set; } = string.Empty; // B-Tree index

    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    [MaxLength(255)]
    public string HeadOfficerName { get; set; } = string.Empty;

    [MaxLength(255)]
    public string ContactEmail { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
