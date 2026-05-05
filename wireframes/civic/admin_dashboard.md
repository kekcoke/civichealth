# Wireframe: Civic Backoffice Dashboard

**Target Audience:** Local Government Workers, City Planners, Finance Clerks
**App Shell:** LGU Civic MFE (`apps/lgu-civic`)
**Required Access:** Token must have `civic_employee` or `super_admin` claim.

## Role-Based Access Control (RBAC) Logic
*   **Absolute Isolation:** No PHI (Protected Health Information) access. This portal cannot query the Ruby BFF.
*   **API Security:** The .NET API enforces access via `[Authorize(Roles = "civic_employee")]`.

## Layout (Desktop)

```text
[=======================================================================]
[ 🏛️ LGU Civic Admin      [Search Citizen ID...]      User: Clerk Bob   ]
[=======================================================================]
[                       |                                               ]
[  -- MODULES --        |  Operations Overview                          ]
[                       |                                               ]
[  [👥] Citizen CRM     |  +--------------------+ +--------------------+]
[  [🏢] Properties      |  | Pending Permits    | | Open 311 Tickets   |]
[  [📜] Permit Queue    |  | 14                 | | 42                 |]
[  [🚨] 311 Dispatch    |  | [Review Queue]     | | [Dispatch Teams]   |]
[  [💵] Finance Batches |  +--------------------+ +--------------------+]
[                       |                                               ]
[  -- SYSTEM --         |  +-----------------------------------------+  ]
[  [⚙️] LGU Settings    |  | 🚨 High Priority 311 Service Requests   |  ]
[  [📊] Reports         |  | --------------------------------------- |  ]
[                       |  | #102 - Water Main Break (Downtown)      |  ]
[                       |  | #103 - Pothole Damage (5th Ave)         |  ]
[                       |  +-----------------------------------------+  ]
[                       |                                               ]
[                       |  +-----------------------------------------+  ]
[                       |  | 💵 Recent Payment Settlements (Gateway) |  ]
[                       |  | --------------------------------------- |  ]
[                       |  | Batch #992: $45,000 (Cleared)           |  ]
[                       |  +-----------------------------------------+  ]
[=======================================================================]
```
