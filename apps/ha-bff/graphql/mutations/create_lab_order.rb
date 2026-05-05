# frozen_string_literal: true

module Mutations
  class CreateLabOrder < GraphQL::Schema::Mutation
    description "Order lab tests or imaging for a patient"

    argument :patient_id,       ID,     required: true
    argument :encounter_id,     ID,     required: false
    argument :ordered_by,       ID,     required: true
    argument :diagnostic_type,  String, required: true
    argument :test_code,        String, required: true
    argument :test_name,        String, required: true

    field :diagnostic, GraphQL::Types::JSON, null: true
    field :errors,     [String],             null: false

    def resolve(**args)
      require_clinician!
      diag = Diagnostic.create(args.merge(result_status: "PENDING"))
      if diag.persisted?
        { diagnostic: diag.as_json, errors: [] }
      else
        { diagnostic: nil, errors: diag.errors.full_messages }
      end
    end

    private

    def require_clinician!
      return if context[:roles].include?("ha_clinician")
      raise GraphQL::ExecutionError, "Unauthorized: ha_clinician role required"
    end
  end
end
