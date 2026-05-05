# Troubleshooting Guide

Common architectural pitfalls, debugging steps, and fixes for the CivicHealth Unified Portal.

---

## Module Federation & MFE

### 1. "Uncaught Error: Shared module is not available for eager consumption"
- **Symptom:** The Angular Shell crashes on load with a webpack shared-module error.
- **Cause:** A federated module or shared library is being imported in `main.ts` directly (eagerly), before Module Federation singletons are initialized.
- **Fix:** Ensure your app bootstraps asynchronously. Move bootstrap logic into `bootstrap.ts` and dynamically import it from `main.ts`:
  ```ts
  // main.ts
  import('./bootstrap');
  ```
- **Verify:** All MFE remotes (`lgu-civic`, `ha-clinical`) already use this pattern. Check `apps/lgu-civic/src/index.ts`.

---

### 2. CORS Blocked on HA Remote Fetch
- **Symptom:** LGU loads, but the HA Remote fails to mount with a CORS error in the browser console.
- **Cause:** The browser fetches JavaScript chunks from the Private Cloud server, which rejects the Public Cloud's origin.
- **Fix:** Configure `Access-Control-Allow-Origin` on the Private Cloud's reverse proxy/Nginx to accept the production URL of the Angular Shell.
  ```nginx
  add_header Access-Control-Allow-Origin "https://civichealth.gov.ph" always;
  add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
  ```
- **Local debug:**
  ```bash
  # Check CORS headers from BFF
  curl -I -H "Origin: http://localhost:4200" http://localhost:4300/api/ha/v1/graphql
  ```

---

### 3. State Desync Between LGU and HA
- **Symptom:** User updates their address in the LGU portal, but the HA portal doesn't reflect it until a hard refresh.
- **Cause:** State is decoupled across MFEs; the HA remote doesn't know an update occurred.
- **Fix:** Verify the LGU app emits the custom event and the HA remote is subscribed:
  ```ts
  // LGU emitter
  window.dispatchEvent(new CustomEvent('CIVIC_PROFILE_UPDATE', { detail: { userId } }));

  // HA subscriber
  window.addEventListener('CIVIC_PROFILE_UPDATE', (e) => { /* re-fetch */ });
  ```

---

## Authentication & Identity

### 4. JWT / Keycloak Token Not Found
- **Symptom:** `useAuthGuard` returns `{ authorized: false, role: null }` even after login.
- **Cause:** `kc_token` was not written to `sessionStorage` after the Keycloak redirect.
- **Debug:**
  ```js
  // Browser console
  sessionStorage.getItem('kc_token')       // should be a JWT string
  sessionStorage.getItem('kc_identity')    // should be the OIDC UUID
  ```
- **Fix:** Ensure the portal-shell's Keycloak redirect handler writes both keys after a successful login flow. Check `apps/portal-shell/src/app/pages/login.component.ts`.

---

### 5. health-status-widget Shows "No linked health record"
- **Symptom:** The `<health-status-widget>` on the citizen dashboard displays "No linked health record found."
- **Cause (Gap 3 fix):** The widget resolves identity in two steps — `patientByFederatedIdentity` query first, then appointments. If the BFF has no patient row with matching `federated_identity`, step 1 returns null.
- **Debug:**
  ```bash
  # Test BFF resolver directly
  curl -X POST http://localhost:4300/api/ha/v1/graphql \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer <kc_token>" \
    -d '{"query":"{ patientByFederatedIdentity(federatedIdentity: \"<uuid>\") { id } }"}'
  ```
- **Fix:** Ensure the patient was onboarded via `onboardPatient` mutation and the `federated_identity` UUID matches the Keycloak `sub` claim exactly.

---

## Database

### 6. SQL Server Connection Refused (ha-bff)
- **Symptom:** `ha-bff` fails to start with `TinyTds::Error: Cannot open server`.
- **Cause:** SQL Server Docker container is not running or not ready.
- **Debug:**
  ```bash
  docker ps | grep civichealth-sqlserver   # check if running
  docker logs civichealth-sqlserver | tail -20  # check initialization
  ```
- **Fix:**
  ```bash
  make db-down && make db-up    # restart container (waits 15s for init)
  make migrate-health           # re-run pending migrations
  ```

---

### 7. EF Core Migration Fails — "relation does not exist" (civic-api)
- **Symptom:** `dotnet ef database update` throws a PostgreSQL error.
- **Cause:** Migration was applied partially, or the DB connection string points to the wrong database.
- **Debug:**
  ```bash
  make migrate-status           # check which migrations are pending
  cd apps/civic-api && dotnet ef migrations list  # list all migrations
  ```
- **Fix:**
  ```bash
  # Apply specific migration
  cd apps/civic-api && dotnet ef database update <MigrationName>
  # Check DB connection
  echo $DATABASE_URL
  ```

---

### 8. ActiveRecord Migration Status Mismatch (ha-bff)
- **Symptom:** `rake db:migrate` reports "already up" but columns are missing.
- **Cause:** Schema version table (`schema_migrations`) is out of sync with actual schema.
- **Debug:**
  ```bash
  cd apps/ha-bff && bundle exec rake db:migrate:status
  # Look for "down" migrations that should be "up"
  ```
- **Fix:**
  ```bash
  # Run all pending down migrations
  cd apps/ha-bff && bundle exec rake db:migrate
  # Force a specific version
  cd apps/ha-bff && bundle exec rake db:migrate:up VERSION=20260505016
  ```

---

## PWA / Service Worker (ha-clinical)

### 9. Stale PWA Cache Serving Old Assets
- **Symptom:** ha-clinical serves outdated JS/CSS after a deployment.
- **Cause:** Angular Service Worker (ngsw) is serving cached assets. The SW updates lazily on next navigation.
- **Debug:**
  ```
  Chrome DevTools → Application → Service Workers
  → Check "Update on reload" for development
  → Click "Unregister" to force-clear
  ```
- **Force update via console:**
  ```js
  navigator.serviceWorker.getRegistrations()
    .then(regs => regs.forEach(r => r.unregister()));
  location.reload();
  ```
- **Note:** ngsw is disabled in development mode (`isDevMode()` check in `PwaModule`). Only affects production builds.

---

### 10. Offline Sync Queue Not Flushing
- **Symptom:** `SyncQueueService` shows pending mutations but doesn't replay after reconnection.
- **Cause:** JWT token stored in the queue entry may have expired, or `OfflineService` did not detect the `online` event.
- **Debug:**
  ```js
  // Check IDB queue in browser console
  import { keys, get } from 'idb-keyval';
  const ks = await keys();
  const entries = await Promise.all(ks.filter(k => k.startsWith('ha_sync_queue_')).map(get));
  console.table(entries);
  ```
- **Fix:** Re-authenticate to refresh the JWT, then trigger a manual flush:
  ```ts
  // Inject SyncQueueService and call:
  syncQueue.flushNow();
  ```

---

## Storybook (shared-ui)

### 11. Storybook Fails to Start — Vite Config Error
- **Symptom:** `npm run storybook` in `libs/shared-ui` fails with a Vite resolution error.
- **Cause:** `node_modules` not installed in `libs/shared-ui` (it has its own `package.json`).
- **Fix:**
  ```bash
  cd libs/shared-ui && npm ci
  npm run storybook
  # or from root:
  make storybook
  ```

---

## CI/CD Workflows

### 12. GitHub Actions: `dorny/paths-filter` Not Triggering Conditional Deploy
- **Symptom:** `deploy-portal-shell` or `deploy-lgu-civic` jobs are skipped even after a relevant file change.
- **Cause:** The `paths-filter` output is a string `'true'`/`'false'`, not a boolean. The `if:` condition must use `== 'true'`.
- **Verify:** Check the `build` job's output in the Actions run → "Detect changed paths" step.

---

### 13. AKS Migration Job Times Out
- **Symptom:** `kubectl wait --for=condition=complete` times out during the `deploy-health-aks` workflow.
- **Cause:** DB migration is taking longer than 120s, or the pod failed to pull the image.
- **Debug:**
  ```bash
  kubectl logs ha-bff-migrate --namespace=ha-secure-zone
  kubectl describe pod ha-bff-migrate --namespace=ha-secure-zone
  ```
- **Fix:** Increase `--timeout=120s` in the workflow, or check ACR pull secrets in the `ha-secure-zone` namespace.
