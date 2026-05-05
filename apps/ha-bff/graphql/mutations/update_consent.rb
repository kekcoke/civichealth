# frozen_string_literal: true

module Mutations
  class UpdateConsent < GraphQL::Schema::Mutation
    description "Manage patient EMR access consent directives"

    argument :patient_id,      ID,      required: true
    argument :directive_type,  String,  required: true
    argument :is_granted,      Boolean, required: true
    argument :granted_to,      String,  required: false
    argument :effective_date,  String,  required: true
    argument :expiry_date,     String,  required: false
    argument :recorded_by,     String,  required: false
    argument :notes,           String,  required: false

    field :consent_directive, GraphQL::Types::JSON, null: true
    field :errors,            [String],             null: false

    def resolve(**args)
      require_clinician!
      directive = ConsentDirective.create(args)
      if directive.persisted?
        { consent_directive: directive.as_json, errors: [] }
      else
        { consent_directive: nil, errors: directive.errors.full_messages }
      end
    end

    private

    def require_clinician!
      return if context[:roles].include?("ha_clinician")
      raise GraphQL::ExecutionError, "Unauthorized: ha_clinician role required"
    end
  end
end
