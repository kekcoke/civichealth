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

## Cloud & DevOps
*   **Hybrid Networking:** CORS configuration across public/private boundaries, VPN/ExpressRoute mechanics, and Reverse Proxy setups.
*   **CI/CD (GitHub Actions / GitLab CI):** Implementing Nx "affected" builds to deploy specific apps to specific clouds autonomously.
