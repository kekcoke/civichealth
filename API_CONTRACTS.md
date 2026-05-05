# API Contracts

## Common Authentication
*   **Header:** `Authorization: Bearer <Keycloak_JWT>`
*   **Role Claims:** `super_admin`, `civic_employee`, `health_employee`, `ha_clinician`, `citizen`

## 1. Civic Public API (.NET 10)
**Base URL:** `/api/civic/v1`
**Protocol:** REST

### Core & Identity
*   `GET /citizens/{id}` - Fetch citizen core identity.
*   `POST /citizens` - Register a new citizen.
*   `PUT /citizens/{id}` - Update citizen profile.
*   `GET /citizens/{id}/bank-accounts` - Get bank details.
*   `POST /citizens/{id}/bank-accounts` - Add bank account.

### Billing & Finance
*   `GET /invoices?status={status}` - Fetch civic invoices.
*   `POST /invoices` - Generate an invoice.
*   `PUT /invoices/{id}` - Adjust or cancel an invoice.
*   `GET /payments` - Retrieve payment history.
*   `POST /payments` - Process a payment.
    *   *Body:* `{ "invoice_id": "uuid", "amount": decimal, "gateway_token": "string" }`
*   `POST /payments/{id}/refund` - Issue a refund.

### Services & Permitting
*   `GET /service-requests` - Fetch status of submitted issues.
*   `POST /service-requests` - Submit a 311 public issue.
*   `PUT /service-requests/{id}` - Update or comment on a request.
*   `DELETE /service-requests/{id}` - Withdraw a request.
*   `GET /permits` - Fetch active permits and applications.
*   `POST /permits` - Apply for a new permit.
*   `GET /properties/{id}` - Fetch property details and zoning.
*   `GET /assessments` - Fetch historical property valuations.

### Communications & Insurance
*   `GET /notifications` - Fetch notification history.
*   `GET /insurance-policies` - View public-sector coverage.

## 2. Health Authority BFF Proxy (Ruby)
**Base URL:** `/api/ha/v1`
**Protocol:** GraphQL

### Patients & Consent
*   `Query: getPatientRecord(federated_identity: ID!)` - Retrieves EMR.
*   `Mutation: onboardPatient(input: PatientInput!)` - Register new patient.
*   `Mutation: updatePatient(input: PatientUpdateInput!)` - Update demographics.
*   `Mutation: updateConsent(input: ConsentInput!)` - Manage EMR access directives.

### Scheduling & Providers
*   `Query: listAppointments(patient_id: ID!)` - Fetch upcoming visits.
*   `Query: searchProviders(specialty: String)` - Find doctors/specialists.
*   `Mutation: scheduleAppointment(input: AppointmentInput!)` - Book an appointment.
*   `Mutation: cancelAppointment(id: ID!)` - Cancel a visit.

### Encounters & Clinical
*   `Query: listEncounters(patient_id: ID!)` - Fetch historical encounters.
*   `Mutation: createEncounter(input: EncounterInput!)` - Log a clinical visit.
*   `Query: getLabResults(patient_id: ID!)` - Fetch diagnostics.
*   `Mutation: createLabOrder(input: LabOrderInput!)` - Order labs/imaging.
*   `Query: getActivePrescriptions(patient_id: ID!)` - List current medications.

### Billing & Insurance
*   `Query: getClinicalBalances(patient_id: ID!)` - Check co-pays and balances.
*   `Query: checkClaimStatus(patient_id: ID!)` - Check insurance claim status.
*   `Mutation: submitClaim(input: ClaimInput!)` - Submit an insurance claim.

**Data Sanitization:** The Ruby BFF automatically strips Protected Health Information (PHI) before returning data if the requesting JWT lacks the `ha_clinician` role.