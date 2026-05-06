# frozen_string_literal: true

require "rails_helper"

RSpec.describe Types::QueryType, type: :graphql do
  describe "get_patient_record" do
    let(:query) { %q{ query { getPatientRecord(federatedIdentity: "%s") { id firstName lastName } } } }

    context "when caller has ha_clinician role" do
      let(:patient) { create(:patient) }

      it "returns full patient record" do
        result = gql(
          query: format(query, patient.federated_identity),
          variables: {},
          headers: auth_header(valid_clinician_token)
        )
        expect(result.dig("data", "getPatientRecord", "firstName")).to eq(patient.first_name)
      end
    end

    context "when caller lacks ha_clinician role" do
      let(:patient) { create(:patient) }

      it "returns readonly patient without clinical fields" do
        result = gql(
          query: format(query, patient.federated_identity),
          variables: {},
          headers: auth_header(valid_citizen_token)
        )
        expect(result.dig("data", "getPatientRecord")).not_to be_nil
        # PHI should be stripped by middleware
        expect(result.to_s).not_to include("clinical_notes")
      end
    end

    context "when patient not found" do
      it "returns nil" do
        result = gql(
          query: format(query, "non-existent-identity"),
          variables: {}
        )
        expect(result.dig("data", "getPatientRecord")).to be_nil
      end
    end
  end

  describe "patient_by_federated_identity" do
    let(:query) { %q{ query { patientByFederatedIdentity(federatedIdentity: "%s") { id } } } }

    it "returns only id for widget use" do
      patient = create(:patient)
      result = gql(query: format(query, patient.federated_identity))
      expect(result.dig("data", "patientByFederatedIdentity", "id")).to eq(patient.id.to_s)
    end
  end

  describe "search_patients" do
    let(:query) { %q{ query { searchPatients(query: "%s") { id firstName lastName } } } }

    context "with ha_clinician role" do
      let(:patient) { create(:patient, first_name: "John", last_name: "Doe") }

      it "finds patient by name" do
        result = gql(query: format(query, "John"), headers: auth_header(valid_clinician_token))
        expect(result.dig("data", "searchPatients")).not_to be_empty
      end

      it "finds patient by phone" do
        result = gql(query: format(query, patient.contact_phone), headers: auth_header(valid_clinician_token))
        expect(result.dig("data", "searchPatients")).not_to be_empty
      end
    end

    context "without ha_clinician role" do
      it "raises authorization error" do
        result = gql(query: format(query, "John"), headers: auth_header(valid_citizen_token))
        expect(result["errors"].first["message"]).to include("ha_clinician role required")
      end
    end
  end

  describe "list_appointments" do
    let(:query) { %q{ query { listAppointments(patientId: "%s") { id status startTime } } } }
    let(:patient) { create(:patient) }
    let(:appointment) { create(:appointment, patient: patient) }

    it "returns upcoming appointments" do
      appointment
      result = gql(query: format(query, patient.id))
      expect(result.dig("data", "listAppointments")).not_to be_nil
    end
  end

  describe "search_providers" do
    let(:query) { %q{ query { searchProviders(specialty: "%s") { id lastName specialtyCode } } } }
    let(:provider) { create(:provider, specialty_code: "CARDIOLOGY") }

    it "filters by specialty" do
      provider
      result = gql(query: format(query, "CARDIOLOGY"))
      expect(result.dig("data", "searchProviders")).not_to be_empty
    end

    it "returns all active providers when no specialty" do
      create(:provider)
      result = gql(query: format(query, ""))
      expect(result.dig("data", "searchProviders")).not_to be_empty
    end
  end

  describe "get_active_prescriptions" do
    let(:query) { %q{ query { getActivePrescriptions(patientId: "%s") { id drugName status } } } }

    it "returns only active prescriptions" do
      patient = create(:patient)
      create(:prescription, patient: patient, status: "ACTIVE", drug_name: "Aspirin")
      create(:prescription, patient: patient, status: "EXPIRED", drug_name: "Old Med")
      result = gql(query: format(query, patient.id))
      drugs = result.dig("data", "getActivePrescriptions")
      expect(drugs.map { |p| p["drugName"] }).to include("Aspirin")
      expect(drugs.map { |p| p["drugName"] }).not_to include("Old Med")
    end
  end
end
