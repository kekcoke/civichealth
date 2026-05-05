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
## [Unreleased] — Phase 4: Ecosystem Expansion
> Branch: `feat/phase-4-ecosystem`

### Planned
- Open Shared UI Kit library to third-party municipal developers
- Implement Offline-first capabilities (PWA) for field clinicians

---

## [Phase 3] — 2026-05-05 · Secure Health Integration
> Branch: `feat/phase-3-health-integration` · Merged to `main`: `db586e8`

### Added — Hybrid Networking (`infra/networking/`)
- `cors-policy.md` — CORS rules for Public → Private Cloud boundary, Nginx DMZ reverse-proxy config (IP allowlist, TLS, proxy headers), VPN/ExpressRoute topology ASCII diagram, security constraints (JWT, role enforcement, no direct DB access)

### Added — HA BFF PHI Enforcement (`apps/ha-bff/`)
- `middleware/phi_sanitizer.rb` — Rack middleware (defence-in-depth): strips PHI fields (`clinical_notes_encrypted`, `diagnosis_codes`, `prescriptions`, `encounters`, etc.) from GraphQL response bodies for any caller lacking `ha_clinician` role; HIPAA / RA 10173 compliant
- `lib/audit_logger.rb` — Compliance audit logger for clinical data access; mirrors SQL Server `audit_clinical_access` trigger; structured JSON output shippable to SIEM / Azure Monitor
- `app.rb` — Wired `PhiSanitizer` middleware via `use Middleware::PhiSanitizer` and added requires for audit logger

### Added — ha-clinical Angular Remote (`apps/ha-clinical/` · Angular 17 + Module Federation)

#### Application Scaffold
- `package.json` — Angular 17, Apollo Angular 6, GraphQL 16, Module Federation deps
- `webpack.config.js` — Module Federation config: exposes `./ClinicalModule` and `./HealthStatusElement` to Portal Shell host; singleton shared deps

#### ClinicalModule (`src/app/clinical/`)
- `clinical.module.ts` — NgModule with child routes: `/patients/:id`, `/appointments`, `/encounters`, `/prescriptions`
- `clinical-dashboard.component.ts` — Dashboard shell: `listAppointments` + `searchProviders` GraphQL queries
- `patient-record/patient-record.component.ts` — Full EMR view: `getPatientRecord` query with nested appointments, prescriptions, encounters
- `appointments/appointments.component.ts` — `scheduleAppointment` + `cancelAppointment` mutations
- `encounters/encounters.component.ts` — `listEncounters` + `createEncounter`
- `prescriptions/prescriptions.component.ts` — `getActivePrescriptions` query

#### Partial Integration Adapter
- `health-status/health-status.element.ts` — Framework-agnostic Custom Element `<health-status-widget>`: embedded in LGU React portal; accepts `federated-identity` + `jwt` attributes; renders appointment count + next appointment date only — zero PHI exposed to citizens; self-contained with scoped CSS

#### Environments
- `src/environments/environment.ts` — Dev: `localhost:9292` BFF, `localhost:8080` Keycloak
- `src/environments/environment.prod.ts` — Prod: `ha-proxy.internal` BFF, `sso.civic.gov` Keycloak

---

## [Phase 2] — 2026-05-05 · Civic Enablement
> Branch: `feat/phase-2-civic-enablement` · Merged to `main`: `f8cc74f`

### Added — Civic API REST Controllers (`apps/civic-api/CivicApi/Controllers/` · .NET 10)

| Controller | Endpoints |
| :--- | :--- |
| `CitizensController` | `GET /citizens/{id}`, `POST /citizens`, `PUT /citizens/{id}`, `GET/POST /citizens/{id}/bank-accounts` |
| `InvoicesController` | `GET /invoices?status=`, `POST /invoices`, `PUT /invoices/{id}` |
| `PaymentsController` | `GET /payments`, `POST /payments` (double-billing guard + invoice auto-update), `POST /payments/{id}/refund` |
| `PermitsController` | `GET /permits` (filterable by citizenId & status), `POST /permits` |
| `ServiceRequestsController` | `GET /service-requests`, `POST /service-requests`, `PUT` (appends `ServiceRequestLog` audit entry), `DELETE` (soft-close) |
| `PropertiesController` | `GET /properties/{id}`, `GET /assessments` (filterable by propertyId & year) |
| `NotificationsController` | `GET /notifications` (filterable by citizenId) |
| `InsurancePoliciesController` | `GET /insurance-policies` (active only, filterable by citizenId) |

### Added — HA BFF GraphQL Schema (`apps/ha-bff/` · Ruby)

#### ActiveRecord Models (8 files)
- `Patient` — validations, federated identity uniqueness, full association graph
- `Provider` — license uniqueness, specialty associations
- `Appointment` — status enum validation, patient/provider/facility associations
- `Encounter` — links to MedicalRecord, has_many diagnostics/prescriptions/claims
- `MedicalRecord` — record_type enum validation
- `Prescription` — status enum, optional encounter association
- `Claim` — unique encounter+provider constraint enforced at model level
- `ConsentDirective` — directive_type enum validation

#### GraphQL Types (6 files)
- `PatientType` — includes nested `appointments`, `prescriptions`, `encounters`
- `ProviderType`, `AppointmentType` (with nested `provider`), `EncounterType`, `PrescriptionType`, `ClaimType`

#### GraphQL QueryType (7 queries)
- `getPatientRecord` — PHI sanitization: strips clinical data if caller lacks `ha_clinician` role
- `listAppointments`, `searchProviders` — scheduling queries
- `listEncounters`, `getLabResults`, `getActivePrescriptions` — clinical queries
- `getClinicalBalances`, `checkClaimStatus` — billing & insurance queries

#### GraphQL Mutations (8 mutations)
- `OnboardPatient`, `UpdatePatient`, `UpdateConsent` — patient management (clinician-only)
- `ScheduleAppointment`, `CancelAppointment` — scheduling
- `CreateEncounter`, `CreateLabOrder` — clinical logging (clinician-only)
- `SubmitClaim` — insurance claim submission

#### Application Bootstrap
- `graphql/schema.rb` — `HaBff::Schema` with `GraphQL::Dataloader`, `max_depth 10`, PHI error guard
- `app.rb` — Sinatra app: CORS headers, JWT RS256 verification middleware, `/api/ha/v1/graphql` POST endpoint, `/health` check

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