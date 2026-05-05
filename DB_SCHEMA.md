# Database Schemas (Sovereign Separation)

To maintain compliance, the databases are physically and logically separated. Data is linked via a federated Identity ID (UUID) provided by the OIDC broker.

## Local Government Unit (Public Cloud - PostgreSQL)
*Optimized for high-concurrency public access and real-time notifications.*

### Core & Finance
| Table | Description | Optimization / Optimization |
| :--- | :--- | :--- |
| `Citizens` | Core identity storage. Linked to OIDC UUID. | B-Tree index on `citizen_id`. |
| `BankAccounts` | Citizen bank details for disbursements/tax refunds. | Encrypted storage with HMAC verification. |
| `Invoices` | Tax, utility, and permit billing records. | Partitioned by `created_at` (monthly). |
| `Payments` | Transaction history and gateway references. | Composite index `(citizen_id, status)`. |

### Communications & Insurance
| Table | Description | Optimization / Optimization |
| :--- | :--- | :--- |
| `Notifications` | Audit trail of SMS/Email/Push sent to citizens. | BRIN index for time-series optimization. |
| `InsurancePolicies` | Public-sector healthcare coverage/subsidies. | GIN index for JSONB policy metadata. |

### Relationships & Constraints
- **Triggers:** `update_tax_status_on_payment` — Automatically updates `Citizens.tax_status` when an `Invoice` is marked as paid.
- **Indexes:** Partial index on `Invoices(status)` where `status = 'OVERDUE'` to speed up collection queries.

---

## Health Authority (Private Cloud / On-Prem - SQL Server)
*Optimized for deep clinical history and strict regulatory audit trails.*

### Clinical & Financial
| Table | Description | Optimization / Optimization |
| :--- | :--- | :--- |
| `Patients` | Clinical profile linked via `federated_identity`. | Clustered index on `patient_id`. |
| `MedicalRecords` | Primary EMR storage for consultations and labs. | Columnstore index for longitudinal analysis. |
| `Claims` | Insurance claims filed against clinical visits. | Unique constraint on `(visit_id, insurance_provider)`. |
| `ClinicalAccounts` | Patient ledger for co-pays and private services. | Transactional triggers for balance consistency. |

### Relationships & Constraints
- **Triggers:** `audit_clinical_access` — Mandatory trigger on `MedicalRecords` to log `physician_id` and timestamp on every SELECT (Compliance).
- **Optimization:** Materialized Views for `PatientSummary` to reduce JOIN overhead during emergency lookups.

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
