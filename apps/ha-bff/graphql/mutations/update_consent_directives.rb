# frozen_string_literal: true

module Mutations
  # Gap 5: Citizen-accessible bulk consent update.
  # Unlike UpdateConsent (ha_clinician only), this mutation accepts the citizen's
  # own OIDC JWT and resolves their patient record via federated_identity.
  # Only the three citizen-facing directive types are permitted.
  class UpdateConsentDirectives < GraphQL::Schema::Mutation
    description "Allows a citizen to update their own EMR consent directives via OIDC identity"

    PERMITTED_TYPES = %w[SHARE_ALL_CLINICS RESTRICT_TO_PCP RESEARCH_OPT_IN].freeze

    class ConsentDirectiveInputType < GraphQL::Schema::InputObject
      graphql_name "ConsentDirectiveInput"
      argument :directive_type, String,  required: true
      argument :is_active,      Boolean, required: true
    end

    argument :federated_identity, ID,                           required: true
    argument :directives,         [ConsentDirectiveInputType],  required: true

    field :success, Boolean,  null: false
    field :errors,  [String], null: false

    def resolve(federated_identity:, directives:)
      # Citizen may only update their own record — compare JWT sub claim
      jwt_sub = context[:jwt_sub]
      unless jwt_sub == federated_identity
        raise GraphQL::ExecutionError, "Unauthorized: cannot update another citizen's consent"
      end

      patient = Patient.find_by(federated_identity: federated_identity)
      return { success: false, errors: ["Patient record not found"] } unless patient

      # Reject any directive types not in the citizen-permitted list
      unknown = directives.map(&:directive_type) - PERMITTED_TYPES
      return { success: false, errors: ["Unknown directive type(s): #{unknown.join(', ')}"] } if unknown.any?

      errors = []
      ActiveRecord::Base.transaction do
        directives.each do |input|
          directive = ConsentDirective.find_or_initialize_by(
            patient_id:     patient.id,
            directive_type: input.directive_type
          )
          directive.is_granted     = input.is_active
          directive.effective_date = Date.today
          directive.recorded_by    = "citizen_self_service"
          unless directive.save
            errors.concat(directive.errors.full_messages)
          end
        end
        raise ActiveRecord::Rollback if errors.any?
      end

      errors.any? ? { success: false, errors: } : { success: true, errors: [] }
    end
  end
end
