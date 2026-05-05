# Product Roadmap (Next 12 Months)

**Phase 1: Foundation & Data Architecture (Q1)**
* Establish Nx Monorepo, Webpack 5 Module Federation, and module boundary rules.
* Provision Data Infrastructure: PostgreSQL (High-Concurrency Civic DB) and SQL Server (Clinical Data with Always Encrypted & Temporal Tables).
* Deploy Portal Orchestrator (Angular Host Shell) to Public Cloud.
* Implement Identity Broker (Keycloak OIDC) for centralized SSO, issuing localized JWTs with role claims (`civic_employee`, `ha_clinician`, `citizen`).

**Phase 2: Civic Enablement (Q2)**
* Develop LGU Public API (.NET 10 REST): Implement endpoints for core identity, billing, services, and permits.
* Launch `lgu-civic` React remote UI and connect to the Civic API.
* Integrate Property Tax, Zoning, and Licensing modules.
* Establish CI/CD pipelines (GitHub Actions/GitLab) with Nx "affected" builds for Public Cloud.

**Phase 3: Secure Health Integration (Q3)**
* Establish Hybrid Networking (VPN/ExpressRoute bridging & cross-boundary CORS).
* Develop HA Secure Proxy Agent (Ruby GraphQL BFF) with strict PHI data sanitization rules.
* Deploy `ha-clinical` Angular remote to Private Cloud server via DMZ.
* Implement "Partial Integration" adapter (Health Status Web Component inside LGU portal).

**Phase 4: Ecosystem Expansion (Q4)**
* Open the Shared UI Kit library to third-party municipal developers.
* Implement Offline-first capabilities (PWA) for field clinicians.