# System Actors and Agents

This document outlines the human and machine agents interacting within the Hybrid Portal.

## Human Personas
*   **Citizen / Patient:** The primary end-user. Accesses the public portal to pay LGU taxes and conditionally checks HA appointment statuses.
*   **Civic Administrator (LGU):** Manages local government workflows (permits, zoning, civic billing). Has zero access to HA data.
*   **Clinician (HA):** Doctors and nurses accessing the portal from within the HA intranet. Needs high-fidelity data and full read/write access to Electronic Medical Records (EMR).

## Machine Agents
*   **Portal Orchestrator (Angular Shell):** The client-side agent responsible for fetching remote modules based on user OIDC scopes.
*   **Identity Broker (Keycloak):** The centralized agent that authenticates users and issues localized JWTs for the Public API vs. the Private API.
*   **HA Secure Proxy Agent:** A backend-for-frontend (BFF) gateway living in the DMZ of the Private Cloud. It sanitizes requests from the Public Shell before allowing them to query the internal HA database.
