# Hybrid Deployment Strategy

Because this is a monorepo spanning two different infrastructure paradigms (Public LGU & Private Healthcare), deployment is highly segmented using `nx affected`.

## Azure Infrastructure Overview

| App | Hosting | Cloud |
|---|---|---|
| `portal-shell` (Angular Host) | Azure Static Web Apps (CDN) | Public |
| `lgu-civic` (React Remote) | Azure Static Web Apps | Public |
| `civic-api` (.NET 10 REST) | Azure App Service | Public |
| `ha-clinical` (Angular Remote) | Served by ha-bff container | Private |
| `ha-bff` (Ruby GraphQL BFF) | Azure Kubernetes Service (AKS) | Private DMZ |

### Option A: Azure App Service (PaaS)
- **Best For:** Fast time-to-market, simpler operational overhead, standard web apps.
- **Pros:** Native GitHub Actions integration, built-in SSL, auto-scaling, ZIP/Docker deployment.
- **Cons:** Less granular network isolation (requires VNet Integration for private connections).
- **Architecture Fit:** `.NET Civic API` and Angular MFEs via Static Web Apps.

### Option B: Azure Kubernetes Service — AKS (CaaS)
- **Best For:** Complex microservices, strict network policies, high scalability.
- **Pros:** Granular network policies (DMZ isolation for Ruby BFF), horizontal scalability, Helm/ArgoCD, Istio mTLS.
- **Cons:** Steep learning curve, higher operational overhead and base cost.
- **Architecture Fit:** **Ruby BFF** due to strict HIPAA/compliance routing and PHI sanitization requirements.

**Recommendation:** Hybrid. Use **Azure Static Web Apps** for Angular Shell + lgu-civic (CDN). Use **Azure App Service** for .NET Civic API. Use **AKS** for Ruby BFF and internal HA microservices.

---

## 1. Public Cloud Pipeline (LGU & Shell) — Azure Static Web Apps

**Trigger:** Push to `main` affecting `apps/portal-shell/**`, `apps/lgu-civic/**`, or `libs/shared-ui/**`.

**Workflow:** `.github/workflows/deploy-frontend-swa.yml`

### Steps
1. `dorny/paths-filter` detects which apps changed — only changed apps are built and deployed.
2. `npm ci` → monorepo root + `libs/shared-ui` (for Storybook) + `apps/lgu-civic` (for Leaflet/react-leaflet).
3. `npx nx build portal-shell --configuration=production` → outputs to `dist/apps/portal-shell/`.
4. `npx webpack --mode production` in `apps/lgu-civic/` → outputs MFE remote bundle.
5. `npm run build-storybook` in `libs/shared-ui/` → outputs to `storybook-static/`.
6. Artifacts uploaded and deployed separately to their respective SWA environments.

### Required Secrets
| Secret | Purpose |
|---|---|
| `AZURE_SWA_PORTAL_TOKEN` | SWA deployment token for portal-shell |
| `AZURE_SWA_LGU_TOKEN` | SWA deployment token for lgu-civic |
| `GITHUB_TOKEN` | Auto-provided by Actions |

### Phase 4 Changes
- `lgu-civic` now has its own `package.json` (Leaflet, react-leaflet) — CI installs it separately.
- Storybook build added as a non-blocking parallel artifact.
- Split build/deploy jobs with `dorny/paths-filter` to avoid redundant deploys.

---

## 2. Public Cloud Backend (.NET Civic API) — Azure App Service

**Trigger:** Push to `main` affecting `apps/civic-api/**` or `libs/civic-models/**`.

**Workflow:** `.github/workflows/deploy-civic-api.yml`

### Steps
1. `dotnet restore` → `dotnet build --configuration Release` → `dotnet test`.
2. `dotnet tool install --global dotnet-ef` → `dotnet ef database update` (EF Core migrations, PostgreSQL).
3. `dotnet publish --configuration Release` → artifact in `./publish/`.
4. Deploy to Azure App Service via `azure/webapps-deploy@v3`.

> **Migration-before-deploy:** EF Core runs against the production PostgreSQL instance using `CIVIC_DB_CONNECTION_STRING` **before** the new binary is deployed. This ensures schema is compatible with the running code.

### Required Secrets
| Secret | Purpose |
|---|---|
| `AZURE_WEBAPP_PUBLISH_PROFILE` | App Service publish profile |
| `CIVIC_DB_CONNECTION_STRING` | PostgreSQL connection string for EF Core migrations |

### Phase 1 Migrations (current)
All 13 EF Core models have been scaffolded. `dotnet ef database update` applies all pending migrations in order.

---

## 3. Private Cloud Pipeline (Health Authority) — AKS

**Trigger:** Push to `main` affecting `apps/ha-clinical/**` or `apps/ha-bff/**`.

**Workflow:** `.github/workflows/deploy-health-aks.yml`

### Steps
1. **Test gate:** `bundle exec rspec` runs in the `test` job — deployment is blocked if tests fail.
2. `npm ci` → `npx nx build ha-clinical --configuration=production` (includes `ngsw-worker.js` for PWA).
3. `docker build` → push `ha-bff` image (`:sha` + `:latest` tags) to Azure Container Registry (ACR).
4. **DB migration Job:** `kubectl run ha-bff-migrate` runs `bundle exec rake db:migrate` as an ephemeral pod in `ha-secure-zone` namespace. Waits for completion (120s timeout) before proceeding.
5. `azure/k8s-deploy@v4` rolls out updated deployment manifests.

> **Migration-before-deploy:** ActiveRecord migrations run as a Kubernetes pod using the new image **before** the rolling deployment begins. This ensures 016 vitals columns and all other Phase 1–4 schema changes are applied before the new BFF code serves traffic.

### Required Secrets
| Secret | Purpose |
|---|---|
| `HA_ACR_LOGIN_SERVER` | ACR login server URL |
| `HA_ACR_USERNAME` | ACR username |
| `HA_ACR_PASSWORD` | ACR password |
| `AZURE_CREDENTIALS` | Azure service principal for AKS context |
| `HA_DATABASE_URL` | SQL Server connection string for ActiveRecord migrations |

### Phase 4 Changes
- Path corrected: `apps/ruby-bff/**` → `apps/ha-bff/**` (consistent with monorepo structure).
- Docker image tag includes both `:sha` and `:latest` for rollback convenience.
- PWA `ngsw-worker.js` is now built and included in the Angular output automatically.
- ActiveRecord migration step added (016 migrations as of Phase 4 — vitals, consent directives, identity resolution).
- RSpec test job added as a prerequisite gate.

### K8s Manifest Paths
```
k8s/
├── ha-bff-deployment.yaml    # Deployment with resource limits + mTLS annotations
├── ha-bff-service.yaml       # ClusterIP service in ha-secure-zone
└── ha-bff-ingress.yaml       # Ingress with cert-manager TLS + CORS headers
```

---

## Deployment Debugging

### Workflow fails at "Detect changed paths" — job skipped unexpectedly
```yaml
# The if: condition MUST compare to the string 'true', not boolean true
if: needs.build.outputs.portal-shell-changed == 'true'   # ✅ correct
if: needs.build.outputs.portal-shell-changed             # ❌ always evaluates true
```

### EF Core migration fails in CI
```bash
# Reproduce locally
cd apps/civic-api
ASPNETCORE_ENVIRONMENT=Production \
  dotnet ef database update \
  --connection "Host=...;Database=...;Username=...;Password=..."

# Check pending migrations
dotnet ef migrations list
```

### AKS migration pod times out
```bash
# Inspect the migration pod logs from within the cluster
kubectl logs ha-bff-migrate --namespace=ha-secure-zone
kubectl describe pod ha-bff-migrate --namespace=ha-secure-zone

# Check ACR pull secret exists in namespace
kubectl get secrets --namespace=ha-secure-zone | grep acr
```

### Docker build fails — `apps/ha-bff/Dockerfile` not found
```bash
# Verify Dockerfile exists
ls apps/ha-bff/Dockerfile
# Build locally to test
docker build -t ha-bff:local -f apps/ha-bff/Dockerfile .
```

### SWA deployment token expired
```
Error: Deployment token is invalid
```
Regenerate the token in Azure Portal → Static Web Apps → Manage deployment token, then update the GitHub secret.

### Angular ngsw-worker.js not generated
- **Cause:** `@angular/service-worker` must be listed in `dependencies` (not `devDependencies`) and `serviceWorker: true` must be set in `angular.json` production configuration.
- **Verify:**
  ```bash
  npx nx build ha-clinical --configuration=production
  ls dist/apps/ha-clinical/ngsw-worker.js   # must exist
  ```

---

*Note: The Angular Shell resolves the HA remote URL dynamically via an environment configuration file loaded at runtime, allowing the Private Cloud to deploy independently of the Public Cloud.*
