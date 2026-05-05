# Database Schemas (Sovereign Separation)

To maintain compliance, the databases are physically and logically separated. Data is linked via a federated Identity ID (UUID) provided by the OIDC broker.

## Local Government Unit (Public Cloud - PostgreSQL)
*Optimized for high-concurrency public access and real-time notifications.*

### Core & Finance
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Citizens` | Core identity storage. Linked to OIDC UUID. | B-Tree index on `citizen_id`. |
| `BankAccounts` | Citizen bank details for disbursements/tax refunds. | Encrypted storage with HMAC verification. |
| `Invoices` | Tax, utility, and permit billing records. | Partitioned by `created_at` (monthly). |
| `Payments` | Transaction history and gateway references. | Composite index `(citizen_id, status)`. |
| `PaymentBatches` | Daily settlement batches from third-party gateways. | B-Tree index on `settlement_date`. |

### Property, Permits & Public Services
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Properties` | Physical land parcels linked to `Citizens`. | **PostGIS GiST index** on `boundary_geom`. |
| `TaxAssessments`| Historical property valuations. | BRIN index for time-series optimization. |
| `Permits` | Building, business, and event permits. | Composite B-Tree on `(citizen_id, permit_type, status)`. |
| `ServiceRequests`| 311 public issues (potholes, sanitation). | Partitioned by `created_at` (Yearly). |
| `ServiceRequestLogs`| Audit trail of updates and LGU responses. | B-Tree index on `request_id`. |

### Communications, Operations & Insurance
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Notifications` | Audit trail of SMS/Email/Push sent to citizens. | BRIN index for time-series optimization. |
| `InsurancePolicies`| Public-sector healthcare coverage/subsidies. | GIN index for JSONB policy metadata. |
| `Departments` | City departments and civic staff directory. | B-Tree index on `department_code`. |

### Relationships & Constraints
- **Triggers:** `update_tax_status_on_payment` — Automatically updates `Citizens.tax_status` when an `Invoice` is marked as paid.
- `trigger_generate_property_tax`: Automatically generates `Invoices` annually based on `TaxAssessments`.
- **Indexes:** Partial index on `Invoices(status)` where `status = 'OVERDUE'` to speed up collection queries.

---

## Health Authority (Private Cloud / On-Prem - SQL Server)
*Optimized for deep clinical history and strict regulatory audit trails.*

### Clinical & Financial
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Patients` | Clinical profile linked via `federated_identity`. | Clustered index on `patient_id`. |
| `MedicalRecords` | Primary EMR storage for consultations and labs. | Columnstore index for longitudinal analysis. |
| `Claims` | Insurance claims filed against clinical visits. | Unique constraint on `(visit_id, insurance_provider)`. |
| `ClinicalAccounts` | Patient ledger for co-pays and private services. | Transactional triggers for balance consistency. |

### Encounters, Scheduling & Providers
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Encounters` | Actual clinical visits (links to `MedicalRecords`). | Clustered Index on `(patient_id, encounter_date)`. |
| `Appointments` | Pre-visit scheduling. | Non-Clustered index on `(provider_id, start_time)`. |
| `Providers` | Clinical staff directory (doctors, nurses). | Non-Clustered Index on `specialty_code`. |
| `ProviderSchedules`| Availability and shift blocks for providers. | Clustered index on `(provider_id, schedule_date)`. |
| `Facilities` | Clinics, wings, and rooms for encounters. | Spatial or hierarchical index. |

### Diagnostics, Pharmacy & Consent
| Table | Description | Indexing & Optimizations |
| :--- | :--- | :--- |
| `Diagnostics` | Lab results and Imaging metadata. | Columnstore Index for epidemiological analytics. |
| `Prescriptions` | Medication history and active scripts. | Temporal Tables enabled for strict audit history. |
| `Formulary` | Approved drug list and interactions. | Clustered index on `drug_code`. |
| `ConsentDirectives`| Patient opt-ins and EMR sharing policies. | Row-Level Security (RLS) enforcement. |

### Relationships & Constraints
- **Triggers:** `audit_clinical_access` — Mandatory trigger on `MedicalRecords` to log `physician_id` and timestamp on every SELECT (Compliance).
- `trigger_drug_interaction_check`: Validates new `Prescriptions` against the `Formulary` and active patient medications using a Stored Procedure.
- **Optimization:** Materialized Views for `PatientSummary` to reduce JOIN overhead during emergency lookups.
- **Security:** Always Encrypted for sensitive fields like HIV status or Psychiatric notes in `MedicalRecords` and `Encounters`.

---

## Optimization Techniques for High-Query Operations

1. **Read-Write Splitting:**
   - Public Cloud: Use PostgreSQL Read Replicas for `Notification` and `Permit` status lookups.
   - Private Cloud: Keep heavy clinical analytics on a secondary warehouse instance.

2. **Federated Query Strategy:**
   - Avoid cross-database queries. The **Angular Shell** performs "Application-Side Joins" by fetching the `citizen_id` from .NET and then requesting the specific `federated_identity` from the Ruby BFF.

3. **Concurrency Control:**
   - Use **Advisory Locks** in PostgreSQL during payment processing to prevent double-billing.
   - Use **Snapshot Isolation** in SQL Server to ensure clinicians see consistent data without blocking reporting queries.
