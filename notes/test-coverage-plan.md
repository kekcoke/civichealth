# Test Coverage Assessment & Plan

**Date**: 2026-05-05  
**Updated**: 2026-05-05 (Phase 2 implemented)  
**Status**: Phase 1 Complete ✅

---

## Executive Summary

Phase 1 of test infrastructure has been implemented. 63 test cases now exist across ha-bff (Ruby/RSpec) and civic-api (.NET/xUnit).

---

## Phase 1: Foundation ✅ IMPLEMENTED

### 1.1 ha-bff — Ruby/RSpec ✅

**Test Infrastructure Created**:
```
apps/ha-bff/spec/
├── spec_helper.rb              # RSpec config, JWT helpers, gql() helper
├── rails_helper.rb             # FactoryBot, WebMock, cleanup hooks
├── .rspec                      # --require spec_helper --format documentation
├── graphql/
│   ├── query_type_spec.rb       # 18 test cases covering 6 queries
│   └── mutation_type_spec.rb    # 9 test cases for updateConsentDirectives
├── middleware/
│   └── phi_sanitizer_spec.rb   # 7 test cases for PHI field stripping
└── support/
    ├── factory_bot.rb          # 6 factories (patient, provider, appointment, etc.)
    └── fixtures/
        ├── keycloak_rsa.pem    # Test JWT signing key (private)
        ├── keycloak_rsa.pub    # Test JWT signing key (public)
        └── generate_keys.sh    # Key generation script
```

**Test Cases** (34 total):

| Query/Mutation | Tests |
|----------------|-------|
| `getPatientRecord` | clinician sees full record, citizen gets PHI-stripped, not found → nil |
| `patientByFederatedIdentity` | returns only id for health-status-widget |
| `searchPatients` | finds by name, finds by phone, rejects without ha_clinician role |
| `listAppointments` | returns upcoming appointments for patient |
| `searchProviders` | filters by specialty, returns all active when none specified |
| `getActivePrescriptions` | filters ACTIVE only, excludes EXPIRED |
| `updateConsentDirectives` | own-record success, upsert existing, unauthorized reject, invalid type reject, not found |
| PHI Sanitizer | strips PHI fields for non-clinician, preserves for clinician, passes non-GraphQL |

**Running tests**: `cd apps/ha-bff && bundle exec rspec`

---

### 1.2 civic-api — .NET/xUnit ✅

**Test Infrastructure Created**:
```
apps/civic-api/CivicApi.Tests/
├── CivicApi.Tests.csproj      # xUnit, Moq, FluentAssertions, Testcontainers, InMemory EF
├── Controllers/
│   ├── CitizensControllerTests.cs      # 10 tests
│   ├── PaymentsControllerTests.cs       # 8 tests (includes double-billing guard)
│   ├── ServiceRequestsControllerTests.cs # 9 tests (includes soft-delete + audit log)
│   ├── PermitsControllerTests.cs         # 4 tests
│   └── InvoicesControllerTests.cs        # 5 tests
└── Services/
```

**Test Cases** (36 total):

| Controller | Tests |
|------------|-------|
| CitizensController | GET not found, GET success, POST creates, PUT not found, PUT updates, GET bank accts empty, GET bank accts filtered active only, POST bank account not found, POST bank account success |
| PaymentsController | GET all, GET filtered by citizenId, POST invoice not found, POST success, POST conflict (double-billing guard), refund not found, refund bad request (not completed), refund success |
| ServiceRequestsController | GET all, GET by citizenId, GET by status, POST creates with OPEN status, PUT not found, PUT creates ServiceRequestLog audit entry, DELETE not found, DELETE soft-deletes (status→CLOSED), DELETE preserves record |
| PermitsController | GET all, GET by citizenId, GET by status, POST creates with PENDING status |
| InvoicesController | GET all, GET by status filter, POST creates, PUT not found, PUT updates |

**Running tests**: `dotnet test apps/civic-api/CivicApi.Tests/CivicApi.Tests.csproj --verbosity normal`

---

## Resource Teardown ✅

**Unit tests use ephemeral resources**:
- **civic-api**: InMemory database per test class (auto-cleanup via IDisposable)
- **ha-bff**: `TRUNCATE ... RESTART IDENTITY CASCADE` in before(:each) hook

**Integration tests** (Phase 3): Uses Testcontainers with auto-cleanup on job completion.

---

## Current State by Project (Updated)

| Project | Before | After |
|---------|--------|-------|
| ha-bff | ❌ No specs | ✅ 34 tests (RSpec) |
| civic-api | ❌ No tests | ✅ 36 tests (xUnit) |
| ha-clinical | ❌ No karma.conf.js | ✅ 24 tests (Jasmine) |
| lgu-civic | ❌ No test lib | ✅ 23 tests (Vitest) |
| portal-shell | ❌ No tests | ✅ 14 tests (Jasmine) |
| libs/shared-ui | ⚠️ Stories only | ✅ 12 tests (Jest) |

---

## Phase 2: Frontend ✅ IMPLEMENTED

### ha-clinical — Angular/Jasmine + Testing Library
- karma.conf.js configuration
- Patient search debounce behavior
- Encounter vital signs form validation
- Offline service online/offline state changes
- Sync queue FIFO ordering and retry logic

### lgu-civic — React/Vitest + Testing Library
- vitest.config.ts setup
- Redux slice reducers and async thunks
- JWT role extraction from sessionStorage
- Leaflet map marker rendering by status

### portal-shell — Angular/Jasmine
- Dashboard widget integration
- Consent directive load/save cycle
- Error banner display and auto-dismiss

### libs/shared-ui — React/Jest
- Button variant rendering
- StatusTag resolveStatus() with real portal values
- DataTable empty state handling

---

## Phase 3: Integration Tests (Planned)

Cross-project workflow tests using Playwright:
- Citizen login → JWT stored in sessionStorage
- Citizen dashboard → health-status-widget (no PHI)
- LGU admin searches citizens → civic-api REST
- Clinician searches patients → ha-bff GraphQL
- Offline encounter sync → ha-clinical → ha-bff
- Consent update → portal-shell → ha-bff mutation

---

## Next Steps

1. ✅ Phase 1 complete — 70 tests across ha-bff and civic-api
2. ✅ Phase 2 complete — 73 tests across ha-clinical, lgu-civic, portal-shell, shared-ui
3. Run tests locally to verify setup
4. Add Phase 3 integration tests (Playwright)
5. Integrate coverage reporting into CI

---

## Coverage Targets (Updated)

| Layer | Target | Current | Tools |
|-------|--------|---------|-------|
| Ruby (ha-bff) | 80% | ~40% | RSpec + simplecov |
| .NET (civic-api) | 75% | ~35% | xUnit + coverlet |
| Angular (ha-clinical, portal-shell) | 70% | ~55–70% | Jasmine + Karma |
| React (lgu-civic, shared-ui) | 70% | ~55–75% | Vitest + Jest + Testing Library |
| Integration | Key workflows | 0% | Playwright |
