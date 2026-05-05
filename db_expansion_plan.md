# Database Architecture Expansion Plan

**Date:** 2026-05-05
**Status:** Proposed

## Executive Summary
This plan outlines the missing schemas, tables, and optimization strategies required to elevate the existing Civic and Healthcare databases to production-grade enterprise standards.

---

## 1. Local Government Unit (Civic - PostgreSQL)

### Identified Missing Entities
1. **Property & Zoning (Taxation Base)**
   - `Properties`: Real estate parcels linked to `Citizens` (Owners).
   - `TaxAssessments`: Historical property valuations.
2. **Permits & Licensing**
   - `Permits`: Building, business, and event permits.
3. **Public Services (311 / Issue Tracking)**
   - `ServiceRequests`: Potholes, sanitation, etc.

### Proposed Additions

| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Properties` | Physical land parcels. | **PostGIS GiST index** on `boundary_geom`. |
| `Permits` | Business & building licenses. | **Composite B-Tree** on `(citizen_id, permit_type, status)`. |
| `ServiceRequests` | Citizen complaints / requests. | **Partitioned** by `created_at` (Yearly). |

### Relationships & Advanced Logic
- **Functions/Triggers:** 
  - `trigger_generate_property_tax`: Automatically generates `Invoices` annually based on the latest `TaxAssessments`.
- **Optimization:** Use PostgreSQL `LISTEN/NOTIFY` for real-time dispatch of `ServiceRequests` to city workers.

---

## 2. Health Authority (Healthcare - SQL Server)

### Identified Missing Entities
1. **Scheduling & Encounters (Consultations)**
   - `Appointments`: Pre-visit scheduling.
   - `Encounters`: Actual clinical visits (links to `MedicalRecords`).
2. **Diagnostics & Labs**
   - `LabOrders` / `LabResults`: Bloodwork, pathology.
   - `ImagingStudies`: Metadata for PACS/DICOM systems.
3. **Pharmacy & Treatment**
   - `Prescriptions`: Medications prescribed during an encounter.
   - `Formulary`: Approved drug list and interactions.
4. **Providers & Facilities**
   - `Providers`: Doctors, nurses, specialists.

### Proposed Additions

| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Providers` | Clinical staff directory. | **Non-Clustered Index** on `specialty_code`. |
| `Encounters` | Patient visits/consultations. | **Clustered Index** on `(patient_id, encounter_date)`. |
| `Diagnostics` | Lab and imaging results. | **Columnstore Index** for epidemiological analytics. |
| `Prescriptions` | Medication history. | **Temporal Tables** enabled for strict audit history. |

### Relationships & Advanced Logic
- **Foreign Keys:** `Encounters` links heavily -> `Patients`, `Providers`, `MedicalRecords`, `Diagnostics`, and `Prescriptions`.
- **Functions/Triggers:** 
  - `trigger_drug_interaction_check`: Validates new `Prescriptions` against the `Formulary` and active patient medications using a Stored Procedure.
- **Optimization:** Implement **Table Partitioning** on `Diagnostics` and `Encounters` by `Year` to archive historical data seamlessly to slower storage tiers. 
- **Security:** Always Encrypted for sensitive fields like HIV status or Psychiatric notes in `MedicalRecords` and `Encounters`.

---

## Next Steps
1. Review the proposed tables, triggers, and indexes.
2. Integrate accepted components into the main `@DB_SCHEMA.md` document.
3. Generate the corresponding SQL DDL scripts for deployment.
