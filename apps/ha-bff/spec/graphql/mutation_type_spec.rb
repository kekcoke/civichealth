# frozen_string_literal: true

require "rails_helper"

RSpec.describe Types::MutationType, type: :graphql do
  describe "update_consent_directives" do
    let(:mutation) do
      <<~GQL
        mutation UpdateConsent($federatedIdentity: ID!, $directives: [ConsentDirectiveInput!]!) {
          updateConsentDirectives(federatedIdentity: $federatedIdentity, directives: $directives) {
            success
            errors
          }
        }
      GQL
    end
    let(:patient) { create(:patient) }

    context "when citizen updates own consent" do
      let(:variables) do
        {
          federatedIdentity: patient.federated_identity,
          directives: [
            { directiveType: "SHARE_ALL_CLINICS", isActive: true },
            { directiveType: "RESTRICT_TO_PCP", isActive: false }
          ]
        }
      end

      it "creates consent directives successfully" do
        token = valid_citizen_token(sub: patient.federated_identity)
        result = gql(query: mutation, variables: variables, headers: auth_header(token))
        expect(result.dig("data", "updateConsentDirectives", "success")).to be true
        expect(result.dig("data", "updateConsentDirectives", "errors")).to be_empty
      end

      it "upserts existing directives" do
        create(:consent_directive, patient: patient, directive_type: "SHARE_ALL_CLINICS", is_granted: false)
        token = valid_citizen_token(sub: patient.federated_identity)
        result = gql(query: mutation, variables: variables, headers: auth_header(token))
        expect(result.dig("data", "updateConsentDirectives", "success")).to be true
      end
    end

    context "when citizen tries to update another citizen's consent" do
      let(:variables) do
        {
          federatedIdentity: patient.federated_identity,
          directives: [{ directiveType: "SHARE_ALL_CLINICS", isActive: true }]
        }
      end

      it "rejects with authorization error" do
        token = valid_citizen_token(sub: "different-citizen")
        result = gql(query: mutation, variables: variables, headers: auth_header(token))
        expect(result["errors"].first["message"]).to include("Unauthorized")
      end
    end

    context "when citizen uses invalid directive type" do
      let(:variables) do
        {
          federatedIdentity: patient.federated_identity,
          directives: [{ directiveType: "ADMIN_ACCESS", isActive: true }]
        }
      end

      it "rejects unknown directive types" do
        token = valid_citizen_token(sub: patient.federated_identity)
        result = gql(query: mutation, variables: variables, headers: auth_header(token))
        expect(result.dig("data", "updateConsentDirectives", "success")).to be false
        expect(result.dig("data", "updateConsentDirectives", "errors").first).to include("Unknown directive type")
      end
    end

    context "when patient record not found" do
      let(:variables) do
        {
          federatedIdentity: "non-existent-identity",
          directives: [{ directiveType: "SHARE_ALL_CLINICS", isActive: true }]
        }
      end

      it "returns error" do
        token = valid_citizen_token(sub: "non-existent-identity")
        result = gql(query: mutation, variables: variables, headers: auth_header(token))
        expect(result.dig("data", "updateConsentDirectives", "success")).to be false
        expect(result.dig("data", "updateConsentDirectives", "errors")).to include("Patient record not found")
      end
    end
  end
end
