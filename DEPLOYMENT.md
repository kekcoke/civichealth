# Hybrid Deployment Strategy

Because this is a monorepo spanning two different infrastructure paradigms (Public LGU & Private Healthcare), deployment is highly segmented using `nx affected`.

## Azure Infrastructure Consideration (App Service vs. AKS)

When deploying the .NET Civic API, Ruby BFF, and Angular MFEs to Azure, the architecture requires balancing operational simplicity against scalability and network isolation.

### Option A: Azure App Service (PaaS)
*   **Best For:** Fast time-to-market, simpler operational overhead, and standard web apps.
*   **Pros:** Native integration with Azure DevOps/GitHub Actions, built-in SSL management, auto-scaling, and easy deployment from ZIP or Docker containers.
*   **Cons:** Less granular control over network isolation (requires VNet Integration for private connections), not ideal for complex microservice mesh architectures, and potential cold start issues on lower tiers.
*   **Architecture Fit:** Excellent for the **Angular MFEs** (via Azure Static Web Apps) and the **.NET Civic API** (Web App).

### Option B: Azure Kubernetes Service - AKS (CaaS)
*   **Best For:** Complex microservices, strict network policies, high scalability, and infrastructure-as-code.
*   **Pros:** Granular network policies (crucial for isolating the Ruby BFF in a DMZ), massive horizontal scalability, unified deployment format (Helm/Manifests) for both public and private workloads, and service mesh capabilities (e.g., Istio) for mTLS between the BFF and SQL Server.
*   **Cons:** Steep learning curve, higher operational overhead (managing node pools, ingress controllers, upgrades), and higher base cost.
*   **Architecture Fit:** Highly recommended for the **Ruby BFF proxy** due to strict HIPAA/compliance routing requirements, and beneficial if the LGU anticipates rapid microservice sprawl.

**Recommendation:** A hybrid approach. Use **Azure Static Web Apps** for the Angular Shell and `lgu-civic` frontend for global CDN distribution. Use **Azure App Service** for the public `.NET Civic API`. Use **AKS** strictly for the secure boundary containing the **Ruby BFF** and internal healthcare microservices.

---

## 1. Public Cloud Pipeline (LGU & Shell) - Azure Static Web Apps
Triggered on merges to `main` that affect `apps/portal-shell` or `apps/lgu-civic`.

1.  `nx affected:build --target=portal-shell,lgu-civic --configuration=production`
2.  Azure Pipeline / GitHub Action deploys `dist/apps/portal-shell` to Azure Static Web Apps.
3.  Deploy `dist/apps/lgu-civic` to the associated Static Web App environment.
4.  Azure Front Door (CDN) automatically routes traffic and caches static assets.

## 2. Public Cloud Backend (.NET Civic API) - Azure App Service
Triggered on merges to `main` that affect the .NET API.

1.  Build and run unit tests for the .NET 10 solution.
2.  Publish artifact (`dotnet publish`).
3.  Deploy ZIP artifact to Azure App Service using the `AzureWebApp@1` task or GitHub Action.

## 3. Private Cloud Pipeline (Health Authority) - AKS / On-Prem
Triggered on merges to `main` that affect `apps/ha-clinical` or the Ruby BFF.

1.  `nx affected:build --target=ha-clinical --configuration=production`
2.  Containerize the output (Frontend) and the Ruby BFF using Docker.
3.  Push images to an Azure Container Registry (ACR) secured via Private Link.
4.  Deploy to Azure Kubernetes Service (AKS) or On-Premise cluster via Helm/ArgoCD.
    *   *Note:* The ingress controller enforces strict mTLS and blocks traffic not originating from the Keycloak/Angular Shell domains.

*Note: The Angular Shell resolves the HA remote URL dynamically via an environment configuration file loaded at runtime, allowing the Private Cloud to deploy independently.*