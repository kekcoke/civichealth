# Wireframes: Health Authority Clinician Modules

Sub-views for the `apps/ha-clinical` application. Strict PHI and auditing constraints apply.

## 1. Patient Directory & Intake
```text
[=======================================================]
[  Patient Search & Intake                              ]
[-------------------------------------------------------]
[  [ Search by Phone, Email, or National ID... ]        ]
[                                                       ]
[  Result: John Doe (UUID: 123e4567...)                 ]
[  [!] This patient is registered in Keycloak.          ]
[  [ Open EMR ]  (Triggers audit_clinical_access)       ]
[                                                       ]
[  No match? [ Register New Patient / Tourist ]         ]
[=======================================================]
```

## 2. Patient EMR View (Longitudinal Chart)
```text
[=======================================================]
[  Patient: John Doe | DOB: 01/15/1980 | UUID: 123e...  ]
[  Allergies: Penicillin  |  Blood: O-                  ]
[-------------------------------------------------------]
[  [📝] Timeline   [🩻] Encounters  [🧪] Diagnostics    ]
[                                                       ]
[  - 04/12/26: Encounter - Annual Physical              ]
[    Notes: Patient reports occasional chest pain.      ]
[    Labs Ordered: Lipid Panel, CBC.                    ]
[                                                       ]
[  - 05/10/26: Encounter - UPCOMING                     ]
[=======================================================]
```

## 3. Active Charting (Encounter Form)
```text
[=======================================================]
[  New Encounter: John Doe  (Date: 05/10/26)            ]
[-------------------------------------------------------]
[  Subjective / Chief Complaint:                        ]
[  [ Text Box...                                      ] ]
[                                                       ]
[  Objective / Vitals:                                  ]
[  HR: [ 72 ]  BP: [ 120/80 ]  Temp: [ 98.6 ]           ]
[                                                       ]
[  [ Save Draft ]  [ Sign & Close Encounter ]           ]
[=======================================================]
```

## 4. e-Prescribing & Formulary Check
```text
[=======================================================]
[  Rx Module: John Doe                                  ]
[-------------------------------------------------------]
[  Search Formulary: [ Lisinopril                     ] ]
[                                                       ]
[  Drug: Lisinopril 10mg Tablets                        ]
[  Sig: Take 1 tablet daily.                            ]
[                                                       ]
[  [!] SYSTEM ALERT: No known interactions with current ]
[      active medications (Atorvastatin).               ]
[                                                       ]
[  [ Submit e-Prescription to Pharmacy ]                ]
[=======================================================]
```