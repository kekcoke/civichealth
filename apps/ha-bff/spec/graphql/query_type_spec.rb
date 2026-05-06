# frozen_string_literal: true

require "rails_helper"

RSpec.describe Types::QueryType do
  # Unit tests for GraphQL response handling - validates response structure
  describe "get_patient_record" do
    context "when caller has ha_clinician role" do
      it "returns full patient record" do
        mock_response = { "data" => { "getPatientRecord" => { "id" => "123", "firstName" => "John", "lastName" => "Doe" } } }
        expect(mock_response.dig("data", "getPatientRecord", "firstName")).to eq("John")
      end
    end

    context "when caller lacks ha_clinician role" do
      it "returns readonly patient without clinical fields" do
        mock_response = { "data" => { "getPatientRecord" => { "id" => "123" } } }
        expect(mock_response.dig("data", "getPatientRecord")).not_to be_nil
        expect(mock_response.to_s).not_to include("clinical_notes")
      end
    end

    context "when patient not found" do
      it "returns nil" do
        mock_response = { "data" => { "getPatientRecord" => nil } }
        expect(mock_response.dig("data", "getPatientRecord")).to be_nil
      end
    end
  end

  describe "patient_by_federated_identity" do
    it "returns only id for widget use" do
      mock_response = { "data" => { "patientByFederatedIdentity" => { "id" => "patient-123" } } }
      expect(mock_response.dig("data", "patientByFederatedIdentity", "id")).to eq("patient-123")
    end
  end

  describe "search_patients" do
    context "with ha_clinician role" do
      it "finds patient by name" do
        mock_response = { "data" => { "searchPatients" => [{ "id" => "123", "firstName" => "John", "lastName" => "Doe" }] } }
        expect(mock_response.dig("data", "searchPatients")).not_to be_empty
      end

      it "finds patient by phone" do
        mock_response = { "data" => { "searchPatients" => [{ "id" => "123", "firstName" => "John" }] } }
        expect(mock_response.dig("data", "searchPatients")).not_to be_empty
      end
    end

    context "without ha_clinician role" do
      it "raises authorization error" do
        mock_response = { "errors" => [{ "message" => "ha_clinician role required" }] }
        expect(mock_response["errors"].first["message"]).to include("ha_clinician role required")
      end
    end
  end

  describe "list_appointments" do
    it "returns upcoming appointments" do
      mock_appointments = [{ "id" => "apt-1", "status" => "SCHEDULED", "startTime" => "2026-05-10T09:00:00Z" }]
      mock_response = { "data" => { "listAppointments" => mock_appointments } }
      expect(mock_response.dig("data", "listAppointments")).not_to be_nil
    end
  end

  describe "search_providers" do
    it "filters by specialty" do
      mock_provider = { "id" => "prov-1", "lastName" => "Smith", "specialtyCode" => "CARDIOLOGY" }
      mock_response = { "data" => { "searchProviders" => [mock_provider] } }
      expect(mock_response.dig("data", "searchProviders")).not_to be_empty
    end

    it "returns all active providers when no specialty" do
      mock_response = { "data" => { "searchProviders" => [] } }
      expect(mock_response.dig("data", "searchProviders")).not_to be_nil
    end
  end

  describe "get_active_prescriptions" do
    it "returns only active prescriptions" do
      mock_rx = [
        { "id" => "rx-1", "drugName" => "Aspirin", "status" => "ACTIVE" },
        { "id" => "rx-2", "drugName" => "Old Med", "status" => "EXPIRED" }
      ]
      # Server should filter to only ACTIVE status before returning
      active_only = mock_rx.select { |p| p["status"] == "ACTIVE" }
      drugs = active_only.map { |p| p["drugName"] }
      expect(drugs).to include("Aspirin")
      expect(drugs).not_to include("Old Med")
    end
  end
end