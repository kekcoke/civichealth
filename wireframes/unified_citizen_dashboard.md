# Wireframe: Unified Citizen & Patient Dashboard

**Target Audience:** General Public (Citizens and Non-Citizen Patients)
**App Shell:** Angular Host (`apps/portal-shell`)
**Required Access:** Authenticated OIDC Token

## Role-Based Access Control (RBAC) Logic
*   **Has `citizen` claim:** Full access to Civic & Health widgets.
*   **No `citizen` claim:** Health widgets only (Civic features hidden). Handles out-of-state visitors and non-residents cleanly.

## Layout (Desktop)

```text
[=======================================================================]
[ Logo: CivicHealth      [Search...]       User: John Doe | [Sign Out]  ]
[=======================================================================]
[                       |                                               ]
[  -- NAVIGATION --     |  Welcome back, John!                          ]
[                       |  UUID: 123e4567-e89b-12d3...                  ]
[  [🏠] Dashboard       |                                               ]
[                       |  +-----------------------------------------+  ]
[  LGU SERVICES *       |  | 🏛️ CIVIC ALERTS (Hidden if no 'citizen')|  ]
[  [💰] My Taxes        |  | --------------------------------------- |  ]
[  [📝] Permits         |  | [!] Property Tax Due: $1,250 (May 15)   |  ]
[  [🚧] 311 Reports     |  | [i] Permit #882 Approved                |  ]
[                       |  |                      [Pay Now ->]       |  ]
[  HEALTH SERVICES      |  +-----------------------------------------+  ]
[  [📅] Appointments    |                                               ]
[  [💊] Prescriptions   |  +-----------------------------------------+  ]
[  [🧪] Lab Results     |  | 🏥 HEALTH ALERTS                        |  ]
[                       |  | --------------------------------------- |  ]
[  SETTINGS             |  | [!] Upcoming Appt: Dr. Smith (May 10)   |  ]
[  [⚙️] Profile         |  | [i] New Lab Results Available           |  ]
[  [🔐] Consent Rules   |  |                      [View EMR ->]      |  ]
[                       |  +-----------------------------------------+  ]
[=======================================================================]
```
* Note: The LGU Services navigation block is dynamically rendered by the Angular Shell only if the Keycloak JWT contains the `citizen` role.
