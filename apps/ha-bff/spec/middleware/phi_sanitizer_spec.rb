# frozen_string_literal: true

require "rails_helper"

RSpec.describe Middleware::PhiSanitizer do
  include Rack::Test::Methods

  let(:app) { HaBff::App }
  let(:sanitizer) { described_class.new(app) }

  describe "#call" do
    context "when caller has ha_clinician role" do
      it "passes response through unchanged" do
        patient = create(:patient, clinical_notes_encrypted: "secret data")
        query = %Q[{ "query": "{ getPatientRecord(federatedIdentity: \"#{patient.federated_identity}\") { clinicalNotesEncrypted } }"}]

        env = {
          "PATH_INFO" => "/api/ha/v1/graphql",
          "REQUEST_METHOD" => "POST",
          "HTTP_AUTHORIZATION" => "Bearer #{valid_clinician_token}",
          "rack.input" => StringIO.new(query)
        }

        status, headers, body = sanitizer.call(env)
        raw = body.join
        expect(raw).to include("secret data")
      end
    end

    context "when caller lacks ha_clinician role" do
      it "strips PHI fields from response" do
        patient = create(:patient, clinical_notes_encrypted: "secret data")
        query = %Q[{ "query": "{ getPatientRecord(federatedIdentity: \"#{patient.federated_identity}\") { clinicalNotesEncrypted } }"}]

        env = {
          "PATH_INFO" => "/api/ha/v1/graphql",
          "REQUEST_METHOD" => "POST",
          "HTTP_AUTHORIZATION" => "Bearer #{valid_citizen_token}",
          "rack.input" => StringIO.new(query)
        }

        status, headers, body = sanitizer.call(env)
        raw = body.join
        expect(raw).not_to include("clinicalNotesEncrypted")
        expect(raw).not_to include("secret data")
      end

      it "strips nested PHI fields" do
        patient = create(:patient)
        create(:encounter, patient: patient, encounter_notes: "patient notes")
        query = %Q[{ "query": "{ listEncounters(patientId: \"#{patient.id}\") { encounterNotes } }"}]

        env = {
          "PATH_INFO" => "/api/ha/v1/graphql",
          "REQUEST_METHOD" => "POST",
          "HTTP_AUTHORIZATION" => "Bearer #{valid_citizen_token}",
          "rack.input" => StringIO.new(query)
        }

        status, headers, body = sanitizer.call(env)
        raw = body.join
        expect(raw).not_to include("encounterNotes")
        expect(raw).not_to include("patient notes")
      end
    end

    context "non-GraphQL endpoints" do
      it "passes through unchanged" do
        env = {
          "PATH_INFO" => "/health",
          "REQUEST_METHOD" => "GET"
        }

        status, headers, body = sanitizer.call(env)
        expect(status).to eq(200)
      end
    end
  end

  describe "PHI_FIELDS constant" do
    it "includes all HIPAA-sensitive fields" do
      expected_fields = %w[
        clinical_notes_encrypted encounter_notes_encrypted diagnosis_codes
        sensitivity_level clinical_notes encounter_notes blood_type
        prescriptions diagnostics claims encounters medical_records
      ]
      expect(Middleware::PhiSanitizer::PHI_FIELDS).to match_array(expected_fields)
    end
  end
end
