# frozen_string_literal: true

module Mutations
  class UpdatePatient < GraphQL::Schema::Mutation
    description "Update patient demographics"

    argument :id,            ID,     required: true
    argument :first_name,    String, required: false
    argument :last_name,     String, required: false
    argument :contact_phone, String, required: false
    argument :contact_email, String, required: false

    field :patient, Types::PatientType, null: true
    field :errors,  [String],           null: false

    def resolve(id:, **args)
      require_clinician!
      patient = Patient.find_by(id: id)
      return { patient: nil, errors: ["Patient not found"] } unless patient

      if patient.update(args.compact)
        { patient: patient, errors: [] }
      else
        { patient: nil, errors: patient.errors.full_messages }
      end
    end

    private

    def require_clinician!
      return if context[:roles].include?("ha_clinician")
      raise GraphQL::ExecutionError, "Unauthorized: ha_clinician role required"
    end
  end
end
