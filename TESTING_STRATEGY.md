# Testing Strategy & Agentic CI/CD Contract

## 1. Supported Testing Frameworks
*   **Frontend (Angular/React):** Jest for Unit Tests, Cypress for End-to-End (E2E) testing.
*   **Civic API (.NET 10):** xUnit for Unit and Integration testing.
*   **Health BFF (Ruby):** RSpec for Unit and Integration testing.
*   **System/Load:** k6 for Stress Testing.

## 2. Agentic Execution Loop & Contract
When an AI agent is executing a feature implementation, it MUST adhere to the following deterministic loop:

### Step 1: Implementation & Local Validation
1. Write the code for the assigned feature specification.
2. Write and execute Unit, Functional, Integration, and Stress tests.
3. **Commit Gate:** The agent shall ONLY commit the changes if and when **ALL** unit, integration, and stress test coverages pass locally.

### Step 2: MR Creation & Remote Validation
4. Push the feature branch to the remote repository.
5. Create a Merge Request (MR) / Pull Request (PR).
6. Wait for the CI/CD pipeline to execute.

### Step 3: Approval & Merge
7. Once the remote CI/CD pipeline passes successfully, the agent must approve and merge the MR into the `main` branch.

### Step 4: Cleanup & Loop Decision
8. Return the local repository to the `main` branch.
9. Update the local branch (`git pull origin main`).
10. **Decision Point:** 
    *   **Continue:** If there are remaining feature specs or tickets in the current assignment, start the loop again from Step 1.
    *   **Terminate:** If the assigned feature spec is fully implemented and merged, terminate the execution loop and report completion.