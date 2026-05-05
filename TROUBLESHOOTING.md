### `TROUBLESHOOTING.md`
```markdown
# Troubleshooting Guide

### 1. "Uncaught Error: Shared module is not available for eager consumption"
*   **Symptom:** The Angular Shell crashes on load.
*   **Cause:** You are importing a federated module or shared library in the `main.ts` file directly.
*   **Fix:** Ensure your app bootstraps asynchronously. Move your bootstrap logic into `bootstrap.ts` and import it dynamically inside `main.ts` using `import('./bootstrap')`.

### 2. CORS Blocked on HA Remote Fetch
*   **Symptom:** LGU loads, but the HA Remote fails to mount with a CORS error in the console.
*   **Cause:** The browser is trying to fetch JavaScript chunks from the Private Cloud server, which is rejecting the Public Cloud's origin.
*   **Fix:** Ensure the Private Cloud's reverse proxy or CDN has `Access-Control-Allow-Origin` configured to accept the production URL of the Angular Shell.

### 3. State Desync Between LGU and HA
*   **Symptom:** User updates their address in the LGU portal, but the HA portal doesn't reflect it until a hard refresh.
*   **Cause:** Since state is decoupled, the HA remote doesn't know the update occurred.
*   **Fix:** Verify the LGU app is emitting the `window.dispatchEvent(new CustomEvent('CIVIC_PROFILE_UPDATE'))` and the HA remote is subscribed to it.
