# Wireframes: Civic Backoffice Modules

Sub-views for the `apps/lgu-civic` application.

## 1. Citizen Directory (CRM)
```text
[=======================================================]
[  Citizen Directory                [Search by ID/Name] ]
[-------------------------------------------------------]
[  Name        | UUID Prefix | Tax Status | Properties  ]
[  Doe, John   | 123e4567... | [IN GOOD]  | 2           ]
[  Roe, Jane   | 884a991b... | [ARREARS]  | 1           ]
[                                                       ]
[  *Note: Cannot see health/patient data from this view.]
[=======================================================]
```

## 2. Permit Processing Pipeline
```text
[=======================================================]
[  Permit Review Queue                                  ]
[-------------------------------------------------------]
[  [ FILTER: Pending Zoning Review v ]                  ]
[                                                       ]
[  Permit #901: Block Party (Applicant: Jane Roe)       ]
[  Location: 123 Main St. | Date: 07/04/2026            ]
[                                                       ]
[  [ Approve ]  [ Request Info ]  [ Reject ]            ]
[=======================================================]
```

## 3. 311 Service Request Dispatch
```text
[=======================================================]
[  311 Dispatch Map & Queue                             ]
[-------------------------------------------------------]
[  [ MAP VIEW PLACEHOLDER ]                             ]
[  * Pothole (5th Ave)  * Broken Streetlight (Elm St)   ]
[                                                       ]
[  Queue: #103 Pothole Damage                           ]
[  [Assign To: Public Works v] [Dispatch]               ]
[=======================================================]
```

## 4. Financial Reconciliation Batches
```text
[=======================================================]
[  Payment Gateway Settlements                          ]
[-------------------------------------------------------]
[  Date       | Batch ID | Total Vol | Status | Action  ]
[  05/04/2026 | B-992    | $45,000   | CLEARED| [Audit] ]
[  05/05/2026 | B-993    | $12,500   | PENDING| [View]  ]
[=======================================================]
```