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
> Branch: `feat/phase-4-ecosystem-expansion`

### Added

#### `apps/lgu-civic` — React Admin Remote (Module Federation)
- `webpack.config.js` — `ModuleFederationPlugin` remote config; exposes 4 modules on port 4201
- `src/index.ts` + `src/bootstrap.tsx` — Deferred bootstrap pattern for MF singleton safety
- `src/App.tsx` — Shell with Carbon-style left nav, `useAuthGuard` role gate, lazy-loaded routes
- `src/hooks/useAuthGuard.ts` — JWT role resolver reading `kc_token` from `sessionStorage`; checks `realm_access.roles` for `civic_employee` / `super_admin`
- `src/store/` — Redux Toolkit slices: `citizenSlice`, `permitSlice`, `serviceRequestSlice`, `financeSlice`
- `src/modules/CitizenDirectory/` — Paginated citizen table with search, status badges, page controls
- `src/modules/PermitQueue/` — Tabbed filter by status; inline Approve/Reject actions
- `src/modules/ServiceRequestDispatch/` — Category filter pills, Leaflet map placeholder (Gap 7 noted), inline assign workflow
- `src/modules/FinanceBatches/` — Summary tiles (count/records/amount), batch table with Post action

#### `apps/ha-clinical` — Angular Clinical MFE (Gap fixes)
- `patient-search/patient-search.component.ts` — Debounced full-text patient search with reactive form; routes to patient record on select (Gap 1)
- `clinical.module.ts` — Registered `PatientSearchComponent` + `ReactiveFormsModule`; added `/patients` default route (Gap 1)
- `encounters/encounters.component.ts` — Extended `CreateEncounter` mutation with 8 vitals fields: HR, systolic/diastolic BP, temperature, SpO₂, respiratory rate, weight, height (Gap 2)

#### `apps/ha-bff` — Ruby GraphQL BFF (Gap fixes)
- `graphql/types/query_type.rb` — Added `patientByFederatedIdentity` resolver (identity bridge for widget) and `searchPatients` full-text query with `ha_clinician` guard (Gaps 1 & 3)
- `graphql/types/encounter_type.rb` — Exposed 8 vitals fields on `EncounterType` (Gap 2)
- `db/migrate/20260505016_add_vitals_to_encounters.rb` — Migration 016: adds HR, BP (systolic/diastolic), temperature, SpO₂, respiratory rate, weight, height to `encounters` table with partial index (Gap 2)

#### `apps/ha-clinical` — health-status-widget (Gap 3 fix)
- `health-status.element.ts` — Two-step identity resolution: `patientByFederatedIdentity` query resolves OIDC UUID → internal patient ID before fetching appointments; graceful "No linked health record" state

#### `apps/portal-shell` — Citizen Dashboard + Consent Settings (Gap 5)
- `pages/dashboard.component.ts` — Unified citizen home: quick-link grid, `<health-status-widget>` Custom Element embed, `<app-consent-settings>` side-by-side panel; reads `kc_token` + `kc_identity` from `sessionStorage`
- `pages/consent-settings.component.ts` — Standalone Angular component; loads existing directives on mount via `getPatientRecord` query; saves 3 directives (SHARE_ALL_CLINICS, RESTRICT_TO_PCP, RESEARCH_OPT_IN) via `updateConsentDirectives` mutation; inline success/error banners with 4s auto-dismiss

#### `apps/ha-bff` — Citizen Consent Mutation (Gap 5)
- `graphql/mutations/update_consent_directives.rb` — Citizen-accessible bulk consent update; validates `jwt_sub == federated_identity` (own-record guard); permits only 3 citizen directive types; transactional upsert with rollback on error
- `graphql/types/mutation_type.rb` — Registered `update_consent_directives` field

#### `apps/lgu-civic` — Leaflet Map in 311 Dispatch (Gap 7)
- `modules/ServiceRequestDispatch/index.tsx` — Replaced static placeholder with full `react-leaflet` `MapContainer`; colored `divIcon` markers per status; `MapFly` helper pans map on row/pin selection; status legend row; bi-directional selection (pin click ↔ list row highlight); `stopPropagation` on assign input to prevent accidental row deselect
- `package.json` — Added `leaflet@^1.9.4`, `react-leaflet@^4.2.1`, `@types/leaflet@^1.9.12`

#### `apps/ha-clinical` — PWA: Offline-First for Field Clinicians
- `src/ngsw-config.json` — Angular Service Worker config; prefetches app shell (HTML/CSS/JS), lazy-caches assets, freshness-strategy data groups for HA BFF appointments and patients (12h / 6h TTL)
- `src/manifest.webmanifest` — PWA installability metadata: `standalone` display, IBM Blue theme color, 3 icon sizes (72/192/512px maskable)
- `src/app/pwa/offline.service.ts` — `OfflineService`: `navigator.onLine` + window `online/offline` events → `BehaviorSubject<boolean>`; synchronous `isOnline()` snapshot + `isOnline$` observable
- `src/app/pwa/sync-queue.service.ts` — `SyncQueueService`: IndexedDB-backed (`idb-keyval`) FIFO mutation queue; auto-flushes on reconnect; JWT expiry guard; up to 5 retries per entry before drop; `enqueue()` / `flushNow()` / `queueSize()` public API
- `src/app/pwa/offline-banner.component.ts` — `OfflineBannerComponent`: sticky status bar (offline=red / syncing=amber / synced=green); queue count display; "Sync Now" manual trigger; standalone Angular component
- `src/app/pwa/pwa.module.ts` — `PwaModule`: registers `ngsw-worker.js` with 3s delayed strategy (prod only); exports `OfflineBannerComponent`; provides `OfflineService` + `SyncQueueService`
- `clinical.module.ts` — Imported `PwaModule`
- `clinical-dashboard.component.ts` — Added `<ha-offline-banner>` sticky header; full Carbon-style nav shell (patients / appointments / encounters / prescriptions)
- `package.json` — Added `@angular/service-worker@^17.0.0`, `idb-keyval@^6.2.1`

#### `libs/shared-ui` — Storybook 8 Documentation
- `.storybook/main.ts` — Storybook 8 config with `@storybook/react-vite` framework; addons: essentials, a11y, interactions; autodocs enabled; telemetry disabled
- `.storybook/preview.ts` — Global preview: design-tokens.css import, 3 background presets (canvas/white/dark), controls matchers, padded layout
- `package.json` — Storybook 8 devDependencies: `storybook`, `@storybook/react-vite`, `@storybook/addon-essentials/a11y/interactions`, `@storybook/test`, `@vitejs/plugin-react`, `idb-keyval`; `storybook` + `build-storybook` scripts
- `Button.stories.tsx` — 8 stories: Primary, Secondary, Tertiary, Ghost, Danger, Disabled, WithIcon, AllVariants; full argTypes for variant/children/disabled; `fn()` click action
- `StatusTag.stories.tsx` — 7 stories: one per status variant, AllStatuses row, AutoResolved (14 real portal value samples demonstrating `resolveStatus()`)
- `AlertCard.stories.tsx` — 6 stories: Info/Success/Warning/Error/NoAction/AllSeverities; decorator constrains max width; real portal copy in story args
- `DataTable.stories.tsx` — 6 stories: InvoicesTable, PermitQueue, AppointmentsTable, EmptyState, NoRowAction, WithCustomRenderer; 3 real-world column/data sets drawn from portal wireframes

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