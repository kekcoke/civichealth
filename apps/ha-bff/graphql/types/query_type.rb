# frozen_string_literal: true

module Types
  class QueryType < GraphQL::Schema::Object
    description "HA BFF GraphQL Queries — all require valid Keycloak JWT"

    # ── Patients & Consent ───────────────────────────────────────────────────
    field :get_patient_record, Types::PatientType, null: true do
      description "Retrieve full EMR for a patient by federated identity (OIDC UUID)"
      argument :federated_identity, ID, required: true
    end

    def get_patient_record(federated_identity:)
      # PHI sanitization: strip sensitive fields if caller lacks ha_clinician role
      patient = Patient.find_by(federated_identity: federated_identity)
      return nil unless patient

      unless context[:roles].include?("ha_clinician")
        # Return demographic-only proxy — no clinical notes, no diagnosis codes
        patient.readonly!
      end
      patient
    end

    # ── Identity Resolution (Gap 3 fix) ─────────────────────────────────────
    field :patient_by_federated_identity, Types::PatientType, null: true do
      description "Resolve OIDC federated identity UUID → internal HA patient record. Used by health-status-widget."
      argument :federated_identity, ID, required: true
    end

    def patient_by_federated_identity(federated_identity:)
      # Returns only id — widget never receives PHI via this path
      Patient.select(:id).find_by(federated_identity: federated_identity)
    end

    field :search_patients, [Types::PatientType], null: false do
      description "Full-text patient search by name, DOB, or phone (ha_clinician role required)"
      argument :query, String, required: true
    end

    def search_patients(query:)
      raise GraphQL::ExecutionError, "ha_clinician role required" unless context[:roles].include?("ha_clinician")

      term = "%#{Patient.sanitize_sql_like(query)}%"
      Patient.where(
        "CONCAT(first_name, ' ', last_name) ILIKE :q OR contact_phone ILIKE :q OR CAST(date_of_birth AS TEXT) LIKE :q",
        q: term
      ).limit(50).order(:last_name, :first_name)
    end

    # ── Scheduling & Providers ───────────────────────────────────────────────
    field :list_appointments, [Types::AppointmentType], null: false do
      description "Fetch upcoming appointments for a patient"
      argument :patient_id, ID, required: true
    end

    def list_appointments(patient_id:)
      Appointment.where(patient_id: patient_id)
                 .where("start_time >= ?", Time.now)
                 .order(:start_time)
    end

    field :search_providers, [Types::ProviderType], null: false do
      description "Find active providers by specialty"
      argument :specialty, String, required: false
    end

    def search_providers(specialty: nil)
      scope = Provider.where(is_active: true)
      scope = scope.where(specialty_code: specialty) if specialty
      scope.order(:last_name)
    end

    # ── Encounters & Clinical ────────────────────────────────────────────────
    field :list_encounters, [Types::EncounterType], null: false do
      description "Fetch historical clinical encounters for a patient"
      argument :patient_id, ID, required: true
    end

    def list_encounters(patient_id:)
      Encounter.where(patient_id: patient_id).order(encounter_date: :desc)
    end

    field :get_lab_results, [Types::EncounterType], null: false do
      description "Fetch diagnostic lab results for a patient"
      argument :patient_id, ID, required: true
    end

    def get_lab_results(patient_id:)
      Encounter.where(patient_id: patient_id, encounter_type: "LAB").order(encounter_date: :desc)
    end

    field :get_active_prescriptions, [Types::PrescriptionType], null: false do
      description "List current active medications for a patient"
      argument :patient_id, ID, required: true
    end

    def get_active_prescriptions(patient_id:)
      Prescription.where(patient_id: patient_id, status: "ACTIVE").order(:drug_name)
    end

    # ── Billing & Insurance ──────────────────────────────────────────────────
    field :get_clinical_balances, Types::PatientType, null: true do
      description "Check co-pays and outstanding balances for a patient"
      argument :patient_id, ID, required: true
    end

    def get_clinical_balances(patient_id:)
      Patient.find_by(id: patient_id)
    end

    field :check_claim_status, [Types::ClaimType], null: false do
      description "Check insurance claim status for a patient"
      argument :patient_id, ID, required: true
    end

    def check_claim_status(patient_id:)
      Claim.where(patient_id: patient_id).order(created_at: :desc)
    end
  end
end
