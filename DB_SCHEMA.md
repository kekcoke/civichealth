# Database Schemas (Sovereign Separation)

To maintain compliance, the databases are physically and logically separated. There are no direct foreign keys between the LGU and HA schemas; they are linked conceptually by a federated Identity ID (UUID) provided by the OIDC broker.

## Local Government Unit (Public Cloud - PostgreSQL)

| Table: `Citizens` | Type | Description |
| :--- | :--- | :--- |
| `citizen_id` | UUID | Primary Key (Matches OIDC Identity) |
| `legal_name` | VARCHAR | Full legal name |
| `residential_address`| VARCHAR | Address for taxation/voting |
| `tax_status` | ENUM | Current standing |

| Table: `Permits` | Type | Description |
| :--- | :--- | :--- |
| `permit_id` | UUID | Primary Key |
| `citizen_id` | UUID | Foreign Key -> Citizens |
| `permit_type` | VARCHAR | e.g., 'Construction', 'Event' |
| `status` | ENUM | 'Pending', 'Approved', 'Rejected' |

---

## Health Authority (Private Cloud / On-Prem - SQL Server/Oracle)

*Note: Access strictly regulated by HA BFF.*

| Table: `Patients` | Type | Description |
| :--- | :--- | :--- |
| `patient_id` | UUID | Primary Key |
| `federated_identity` | UUID | Indexed (Matches OIDC Identity - Use for cross-referencing) |
| `dob` | DATE | Date of Birth |
| `blood_type` | VARCHAR | Clinical data |

| Table: `MedicalRecords` | Type | Description |
| :--- | :--- | :--- |
| `record_id` | UUID | Primary Key |
| `patient_id` | UUID | Foreign Key -> Patients |
| `clinical_notes` | TEXT | Encrypted at rest |
| `attending_physician` | UUID | Reference to Clinician directory |
