# CivicHealth Unified Portal (LGU-HA Bridge)

Welcome to the CivicHealth Unified Portal. This repository is configured as an **Agentic Development Environment**, meaning its documentation, testing contracts, and architecture are explicitly structured to support both human developers and autonomous AI engineering agents.

## 📚 Documentation Index (Agent Entrypoint)
Before implementing features or modifying the system, AI agents and developers must consult the following specification files to understand system boundaries, contracts, and execution rules:

*   **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Cloud-hybrid topology, component diagrams, and network boundaries (Public Cloud vs. Private On-Premise).
*   **[API_CONTRACTS.md](./API_CONTRACTS.md)**: Protocol definitions including REST for the .NET 10 Civic API and GraphQL for the Ruby Health BFF.
*   **[TESTING_STRATEGY.md](./TESTING_STRATEGY.md)**: Supported testing frameworks and the strict deterministic **Agentic CI/CD Execution Loop** governing autonomous commits and PR merges.
*   **[DB_SCHEMA.md](./DB_SCHEMA.md)** & **[db_expansion_plan.md](./db_expansion_plan.md)**: Sovereign database separation rules, schemas, and indexing strategies for PostgreSQL (Civic) and SQL Server (Health).
*   **[AGENTS.md](./AGENTS.md)**: Definitions of Human Personas and Machine Agents (e.g., Identity Broker, Proxy Agents) interacting within the portal.
*   **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Segmented build and deployment pipelines using `nx affected` for public and private infrastructure.
*   **[SKILLS.md](./SKILLS.md)**: Technology stack, required backend/frontend frameworks, and architectural competencies.
*   **[PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md)**: Phased feature rollout plan over the next 12 months.
*   **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)**: Known architectural pitfalls, CORS mitigation, and Micro-Frontend state synchronization fixes.
*   **[DESIGN.MD](./DESIGN.md)**: Styling for micro frontends.
*   **[WIREFRAMES](./WIREFRAMES)**: Directory containing ASCII wireframes.

---

## Overview
This repository contains the monorepo for the CivicHealth Unified Portal, integrating Local Government Unit (LGU) civic services with Health Authority (HA) clinical systems. It utilizes an **Angular-driven Micro-Frontend (MFE)** architecture orchestrated via **Nx** and **Webpack Module Federation**.

To ensure compliance with strict data privacy laws (HIPAA/GDPR/PIPEDA), the system utilizes a **Cloud-Hybrid Deployment Model**. Public-facing civic services are hosted in the Public Cloud, while sensitive clinical services remain in the HA's On-Premise Private Cloud. Integration occurs purely on the client-side via a secure, token-mediated Angular Shell.

## Repository Structure (Nx Workspace)
- `apps/portal-shell`: The host Angular application (Public Cloud).
- `apps/lgu-civic`: React remote application for government services (Public Cloud).
- `apps/ha-clinical`: Angular remote application for health services (Private Cloud).
- `apps/civic-api`: .NET 10 REST API for LGU civic services (Public Cloud).
- `apps/ha-bff`: Ruby GraphQL Backend-for-Frontend proxy in HA DMZ (Private Cloud).
- `libs/shared-ui`: Carbon/IBM design tokens and atomic components (Angular + React).
- `libs/shared-auth`: OIDC/Keycloak integration and state management.

---

## Quick Start

### Prerequisites
| Tool | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Angular, React, Nx |
| .NET SDK | 10.0+ | civic-api |
| Ruby | 3.2+ | ha-bff |
| Docker | latest | SQL Server (ha-bff local DB) |
| tmux | any | Parallel dev sessions (`make dev`) |

### 1. Clone & Install
```bash
git clone https://github.com/kekcoke/civichealth.git
cd civichealth
make install          # installs Node + Ruby + .NET dependencies
```

### 2. Start the database (ha-bff requires SQL Server)
```bash
make db-up            # starts SQL Server 2022 in Docker on :1433
make migrate          # runs EF Core + ActiveRecord migrations
```

### 3. Run all services (full stack)
```bash
make dev              # opens tmux with 5 panes — requires tmux
```

Or start services individually:
```bash
make dev-shell        # Angular portal-shell    → http://localhost:4200
make dev-lgu          # React lgu-civic          → http://localhost:4201
make dev-clinical     # Angular ha-clinical      → http://localhost:4202
make dev-bff          # Ruby ha-bff              → http://localhost:4300
                      # .NET civic-api           → http://localhost:5000
```

Or start by domain:
```bash
make dev-civic        # portal-shell + lgu-civic + civic-api
make dev-health       # ha-clinical + ha-bff
```

### 4. Storybook (shared-ui component library)
```bash
make storybook        # → http://localhost:6006
```

---

## Common Commands

| Command | Description |
|---|---|
| `make install` | Install all dependencies |
| `make dev` | Start full stack (tmux) |
| `make dev-civic` | Start civic services only |
| `make dev-health` | Start health services only |
| `make migrate` | Run all pending DB migrations |
| `make migrate-status` | Check migration status for both DBs |
| `make test` | Run all tests (frontend + backend) |
| `make lint` | Lint all code |
| `make build` | Production build (all apps) |
| `make clean` | Remove build artifacts |
| `make storybook` | Start Storybook on :6006 |

> Run `make help` for the full command reference.

---

## Debugging Quick Reference

### Service won't start
```bash
# Check ports in use
lsof -i :4200   # portal-shell
lsof -i :4201   # lgu-civic
lsof -i :4202   # ha-clinical
lsof -i :4300   # ha-bff
lsof -i :1433   # SQL Server

# Kill a port
kill -9 $(lsof -ti :4200)
```

### Module Federation errors
```bash
# Clear Nx cache and rebuild
npx nx reset && make build-civic
```

### SQL Server connection refused
```bash
# Check container status
docker ps | grep civichealth-sqlserver
# Restart if stopped
make db-down && make db-up && make migrate-health
```

### Angular Service Worker (PWA) stale cache in dev
```bash
# Unregister SW in Chrome DevTools → Application → Service Workers → Unregister
# Or force-clear via CLI:
npx nx build ha-clinical --configuration=development  # SW disabled in dev mode
```

### JWT / Keycloak auth failures
```bash
# Verify kc_token is written to sessionStorage after login
# In browser console:
sessionStorage.getItem('kc_token')
sessionStorage.getItem('kc_identity')
```

> See **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** for detailed issue resolution.
