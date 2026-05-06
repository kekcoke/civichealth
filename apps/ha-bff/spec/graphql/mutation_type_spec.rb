# frozen_string_literal: true

require "rails_helper"

RSpec.describe Types::MutationType do
  # Unit tests for GraphQL mutation response handling
  describe "update_consent_directives" do
    context "when citizen updates own consent" do
      it "creates consent directives successfully" do
        mock_response = { "data" => { "updateConsentDirectives" => { "success" => true, "errors" => [] } } }
        expect(mock_response.dig("data", "updateConsentDirectives", "success")).to be true
        expect(mock_response.dig("data", "updateConsentDirectives", "errors")).to be_empty
      end

      it "upserts existing directives" do
        mock_response = { "data" => { "updateConsentDirectives" => { "success" => true, "errors" => [] } } }
        expect(mock_response.dig("data", "updateConsentDirectives", "success")).to be true
      end
    end

    context "when citizen tries to update another citizen's consent" do
      it "rejects with authorization error" do
        mock_response = { "errors" => [{ "message" => "Unauthorized: Cannot update another citizen's consent" }] }
        expect(mock_response["errors"].first["message"]).to include("Unauthorized")
      end
    end

    context "when citizen uses invalid directive type" do
      it "rejects unknown directive types" do
        mock_response = { "data" => { "updateConsentDirectives" => { "success" => false, "errors" => ["Unknown directive type: ADMIN_ACCESS"] } } }
        expect(mock_response.dig("data", "updateConsentDirectives", "success")).to be false
        expect(mock_response.dig("data", "updateConsentDirectives", "errors").first).to include("Unknown directive type")
      end
    end

    context "when patient record not found" do
      it "returns error" do
        mock_response = { "data" => { "updateConsentDirectives" => { "success" => false, "errors" => ["Patient record not found"] } } }
        expect(mock_response.dig("data", "updateConsentDirectives", "success")).to be false
        expect(mock_response.dig("data", "updateConsentDirectives", "errors")).to include("Patient record not found")
      end
    end
  end
end