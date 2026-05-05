# Changelog

All notable changes to the CivicHealth Hybrid Portal are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] — Phase 2: Civic Enablement
> Branch: `feat/phase-2-civic-api`

### Planned
- `.NET 10` REST API controllers for all Civic endpoints (Citizens, Invoices, Payments, Permits, ServiceRequests, Properties)
- Ruby GraphQL schema, types, queries, and mutations for the HA BFF
- CI/CD pipeline updates for Public Cloud deployment with Nx "affected" builds

---

## [Phase 1] — 2026-05-05 · Foundation & Data Infrastructure
> Branch: `feat/phase-1-database-setup` · Commit: `f17da63`

### Added — Civic API (`apps/civic-api/` · .NET 10 + EF Core + PostgreSQL)

#### Entity Models (13 tables)
- `Citizen` — Core identity with OIDC UUID federated identity link and `TaxStatus`
- `BankAccount` — HMAC-verified encrypted account storage per citizen
- `Invoice` — Tax, utility, and permit billing; partitioned by `created_at` (monthly)
- `Payment` — Transaction history with gateway token reference; composite index `(CitizenId, Status)`
- `PaymentBatch` — Daily settlement batches; B-Tree index on `SettlementDate`
- `Property` — Land parcels with PostGIS `BoundaryGeom`; GiST spatial index
- `TaxAssessment` — Historical property valuations; BRIN time-series index on `AssessedAt`
- `Permit` — Building, business, event permits; composite index `(CitizenId, PermitType, Status)`
- `ServiceRequest` — 311 public issues; partitioned by `created_at` (yearly)
- `ServiceRequestLog` — Audit trail of LGU updates; B-Tree index on `RequestId`
- `Notification` — SMS/Email/Push audit trail; BRIN time-series index on `SentAt`
- `InsurancePolicy` — Public-sector coverage with JSONB `Metadata`; GIN index
- `Department` — City departments directory; unique B-Tree index on `DepartmentCode`

#### Infrastructure
- `AppDbContext` — Full EF Core fluent configuration: B-Tree, composite, partial (`OVERDUE`), BRIN, GiST, GIN indexes
- `InitialCivicSchema` — EF Core migration generated via `dotnet-ef` (build clean, zero warnings)
- `Program.cs` — Registered `AppDbContext` with `UseNpgsql` + `UseNetTopologySuite` (PostGIS)
- `appsettings.json` / `appsettings.Development.json` — Connection strings via environment variables
- NuGet packages: `Microsoft.EntityFrameworkCore` 9.0, `Npgsql.EntityFrameworkCore.PostgreSQL` 9.0, `Npgsql.EntityFrameworkCore.PostgreSQL.NetTopologySuite` 9.0, `Microsoft.EntityFrameworkCore.Design` 9.0

### Added — HA BFF (`apps/ha-bff/` · Ruby + ActiveRecord + SQL Server)

#### Migrations (15 files)
| Migration | Table | Key Index / Feature |
|---|---|---|
| `001` | `patients` | Federated identity unique index |
| `002` | `providers` | Non-clustered index on `specialty_code` |
| `003` | `facilities` | Hierarchical `parent_id` (clinic → wing → room) |
| `004` | `provider_schedules` | Composite index `(provider_id, schedule_date)` |
| `005` | `appointments` | Composite index `(provider_id, start_time)` |
| `006` | `medical_records` | Always Encrypted columns for PHI; Columnstore noted |
| `007` | `encounters` | Clustered composite `(patient_id, encounter_date)` |
| `008` | `diagnostics` | LOINC `test_code` index; Columnstore noted |
| `009` | `formularies` | Unique `drug_code`; `drug_class` index |
| `010` | `prescriptions` | Composite `(patient_id, status)`; Temporal Tables noted |
| `011` | `consent_directives` | Composite `(patient_id, directive_type)`; RLS noted |
| `012` | `clinical_accounts` | Unique `patient_id`; transactional balance triggers |
| `013` | `claims` | Unique `(encounter_id, insurance_provider)` |
| `014` | *(index migration)* | Nonclustered Columnstore on `medical_records` + `diagnostics` via raw SQL |
| `015` | *(temporal migration)* | System-Time Temporal Table on `prescriptions` via raw SQL |

#### Infrastructure
- `Gemfile` — ActiveRecord 7.2, `activerecord-sqlserver-adapter`, `tiny_tds`, `standalone_migrations`, `sinatra`, `graphql`, `jwt`, `rack-cors`, `puma`
- `Rakefile` — `standalone_migrations` task loader (`rake db:migrate`)
- `config/database.yml` — Multi-environment SQL Server config; all credentials via `ENV.fetch`
- `config/initializers/database.rb` — ActiveRecord connection bootstrapper

### Changed
- `PRODUCT_ROADMAP.md` — Updated all phases with specific technologies, agent names, and index strategies
- `.gitignore` — Excluded `.NET` `bin/` and `obj/` build artifacts and Ruby `vendor/bundle/`

---

## [Pre-Phase 1] — Project Bootstrap
### Added
- `ARCHITECTURE.md` — Cloud-hybrid topology (Public Cloud LGU vs. Private Cloud HA)
- `API_CONTRACTS.md` — Civic REST API (.NET 10) and HA GraphQL BFF (Ruby) contracts
- `DB_SCHEMA.md` — Sovereign database schemas: PostgreSQL (Civic) + SQL Server (HA)
- `SKILLS.md` — Required team competencies
- `AGENTS.md` — Human personas and machine agent definitions
- `TESTING_STRATEGY.md`, `DEPLOYMENT.md`, `TROUBLESHOOTING.md` — Operational docs
- `wireframes/` — Citizen portal, admin, and clinician dashboard wireframes
