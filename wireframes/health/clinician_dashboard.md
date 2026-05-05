# Wireframe: Health Authority Clinician Portal

**Target Audience:** Doctors, Nurses, Healthcare Specialists
**App Shell:** HA Clinical MFE (`apps/ha-clinical`)
**Required Access:** Token must have `ha_clinician` claim.

## View Logic (Data Sanitization & Auditing)
*   **PHI Access:** Ruby BFF validates the `ha_clinician` role. If valid, full EMR queries succeed.
*   **Audit Logging:** Every click on a patient UUID triggers the `audit_clinical_access` trigger in SQL Server.
*   **Isolation:** No Civic data (Taxes/Permits) is accessible or visible from this portal.

## Layout (Desktop)

```text
[=======================================================================]
[ 🏥 HA Clinician Portal  [Search Patient UUID..]   User: Dr. Smith     ]
[=======================================================================]
[                       |                                               ]
[  -- CLINICAL --       |  My Schedule - Today, May 5th                 ]
[                       |                                               ]
[  [📅] My Schedule     |  +-------+-------------------+---------------+]
[  [🩻] Active Encounters|  | Time  | Patient (UUID)    | Reason        |]
[  [🧪] Lab Orders      |  |-------|-------------------|---------------|]
[  [💊] e-Prescribing   |  | 09:00 | Doe, J. (123e...) | Checkup       |]
[                       |  | 09:30 | Roe, R. (987f...) | Lab Review    |]
[  -- FACILITIES --     |  | 10:00 | [ AVAILABLE ]     |               |]
[  [🏥] Clinic Status   |  +-------+-------------------+---------------+]
[  [🛏️] Bed Management  |                                               ]
[                       |  +-----------------------------------------+  ]
[                       |  | 🚨 Critical Patient Alerts              |  ]
[                       |  | --------------------------------------- |  ]
[                       |  | [!] Abnormal Lab Result: J. Doe (A1C)   |  ]
[                       |  | [!] Drug Interaction Risk: R. Roe       |  ]
[                       |  +-----------------------------------------+  ]
[=======================================================================]
```
