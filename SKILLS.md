# Required Team Competencies

To successfully develop, deploy, and maintain this hybrid platform, the engineering teams must possess the following competencies:

## Platform & Core Architecture
*   **Nx Monorepo Management:** Understanding computational caching, project graph analysis, and boundary enforcement rules.
*   **Webpack 5 Module Federation:** Deep knowledge of shared dependencies, singleton enforcement, and dynamic remote loading.
*   **OIDC / OAuth2.0:** Implementing token exchange and managing scoped access across distributed micro-frontends.

## Frontend Frameworks
*   **Angular (v15+):** Advanced routing, RxJS state management, and strict TypeScript interfaces (for the Shell and HA remotes).
*   **React/Vue:** Component lifecycle and state management (for the LGU remotes).
*   **Web Components:** Building framework-agnostic custom elements for partial cross-domain integration.

## Backend Frameworks
*   **.NET 10:** Building scalable cloud-native public APIs, handling civic data, billing, and public permits.
*   **Ruby:** Developing secure Backend-for-Frontend (BFF) proxies, implementing strict data sanitization, and handling clinical EMR access in private clouds.

## Database & Data Architecture
*   **PostgreSQL:** High-concurrency optimization, PostGIS for geospatial data, table partitioning, and advanced concurrency controls for public civic databases.
*   **SQL Server:** Deep clinical history management, Columnstore indexes for analytics, Temporal Tables for strict auditing, and 'Always Encrypted' security for Protected Health Information (PHI).

## Cloud & DevOps
*   **Hybrid Networking:** CORS configuration across public/private boundaries, VPN/ExpressRoute mechanics, and Reverse Proxy setups.
*   **CI/CD (GitHub Actions / GitLab CI):** Implementing Nx "affected" builds to deploy specific apps to specific clouds autonomously.
