# frozen_string_literal: true

module Mutations
  class CreateEncounter < GraphQL::Schema::Mutation
    description "Log a clinical visit encounter"

    argument :patient_id,       ID,     required: true
    argument :provider_id,      ID,     required: true
    argument :facility_id,      ID,     required: false
    argument :encounter_date,   String, required: true
    argument :encounter_type,   String, required: false
    argument :chief_complaint,  String, required: false

    field :encounter, Types::EncounterType, null: true
    field :errors,    [String],             null: false

    def resolve(**args)
      require_clinician!
      encounter = Encounter.new(args.merge(status: "OPEN"))
      if encounter.save
        { encounter: encounter, errors: [] }
      else
        { encounter: nil, errors: encounter.errors.full_messages }
      end
    end

    private

    def require_clinician!
      return if context[:roles].include?("ha_clinician")
      raise GraphQL::ExecutionError, "Unauthorized: ha_clinician role required"
    end
  end
end
