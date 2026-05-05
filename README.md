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

---

## Overview
This repository contains the monorepo for the CivicHealth Unified Portal, integrating Local Government Unit (LGU) civic services with Health Authority (HA) clinical systems. It utilizes an **Angular-driven Micro-Frontend (MFE)** architecture orchestrated via **Nx** and **Webpack Module Federation**.

To ensure compliance with strict data privacy laws (HIPAA/GDPR/PIPEDA), the system utilizes a **Cloud-Hybrid Deployment Model**. Public-facing civic services are hosted in the Public Cloud, while sensitive clinical services remain in the HA's On-Premise Private Cloud. Integration occurs purely on the client-side via a secure, token-mediated Angular Shell.

## Repository Structure (Nx Workspace)
- `apps/portal-shell`: The host Angular application (Public Cloud).
- `apps/lgu-civic`: React remote application for government services (Public Cloud).
- `apps/ha-clinical`: Angular remote application for health services (Private Cloud).
- `libs/shared-ui`: Agnostic Tailwind CSS design tokens and base components.
- `libs/shared-auth`: OIDC/Keycloak integration and state management.

## Quick Start
1. Install dependencies: `npm install`
2. Run the shell and all remotes: `nx run-many --target=serve --all`
3. Navigate to `http://localhost:4200`
