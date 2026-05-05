# Wireframes: Citizen & Patient Portal Modules

These wireframes cover the sub-views accessible from the main Unified Dashboard.

## 1. Unified Login / Registration (Keycloak OIDC)
```text
[=======================================================]
[                  CIVIC HEALTH PORTAL                  ]
[                                                       ]
[  [ Email Address / National ID     ]                  ]
[  [ Password                        ]                  ]
[                                                       ]
[  [       SIGN IN (Identity Broker)       ]            ]
[                                                       ]
[  New resident or patient? [ Register Here ]           ]
[=======================================================]
```

## 2. Profile & Settings (Cross-Domain)
```text
[=======================================================]
[  My Profile                 [Edit Info] [Bank Details]]
[-------------------------------------------------------]
[  Name: John Doe                                       ]
[  OIDC Identity (UUID): 123e4567-e89b...               ]
[                                                       ]
[  [🔐] EMR Consent Directives (Health)                 ]
[  ( ) Share EMR with all HA Clinics                    ]
[  (*) Restrict EMR to Primary Care Provider Only       ]
[  [x] Opt-in to anonymized public health research      ]
[=======================================================]
```

## 3. Civic: Financials & Invoices (.NET)
```text
[=======================================================]
[  My Taxes & Invoices                  [ + Pay Custom ]]
[-------------------------------------------------------]
[  Status | Invoice # | Type         | Due Date | Amount]
[  [UNPD] | INV-0092  | Property Tax | 05/15/26 | $1,250]
[  [PAID] | INV-0041  | Pet License  | 01/10/26 | $45.00]
[                                                       ]
[  [ Proceed to Secure Payment Gateway -> ]             ]
[=======================================================]
```

## 4. Civic: Permitting Hub (.NET)
```text
[=======================================================]
[  Permits & Licensing              [ + Apply for New ] ]
[-------------------------------------------------------]
[  Active Applications:                                 ]
[  Permit #882 - Home Renovation (Kitchen)              ]
[  Status: [APPROVED] - Ready for payment.              ]
[                                                       ]
[  Permit #901 - Block Party (July 4th)                 ]
[  Status: [UNDER REVIEW] - Awaiting zoning approval.   ]
[=======================================================]
```

## 5. Civic: 311 Service Requests (.NET)
```text
[=======================================================]
[  311 Public Issue Reports           [ + Report Issue ]]
[-------------------------------------------------------]
[  #103 - Pothole Damage (5th Ave)                      ]
[  Status: [IN PROGRESS]                                ]
[  Logs:                                                ]
[   - 05/01: Ticket Submitted                           ]
[   - 05/02: Assigned to Public Works Dept.             ]
[   - 05/04: Work crew dispatched.                      ]
[=======================================================]
```

## 6. Health: Appointments Manager (Ruby BFF)
```text
[=======================================================]
[  My Appointments                  [ + Book New Appt ] ]
[-------------------------------------------------------]
[  Upcoming:                                            ]
[  [MAY 10] General Checkup w/ Dr. Smith (09:00 AM)     ]
[           Location: Downtown Clinic, Room 3A          ]
[           [Reschedule]  [Cancel]                      ]
[                                                       ]
[  Past:                                                ]
[  [APR 12] Bloodwork Lab (Completed)                   ]
[=======================================================]
```

## 7. Health: My EMR & Labs (Ruby BFF)
```text
[=======================================================]
[  My Health Record (EMR)                               ]
[-------------------------------------------------------]
[  [🧪] Recent Lab Results                              ]
[       - Complete Blood Count (04/12/26) [VIEW]        ]
[       - Lipid Panel (04/12/26) [! ABNORMAL] [VIEW]    ]
[                                                       ]
[  [💊] Active Prescriptions                            ]
[       - Lisinopril 10mg (Refills: 2) [Request Refill] ]
[       - Atorvastatin 20mg (Refills: 0) [Contact Dr.]  ]
[=======================================================]
```