# frozen_string_literal: true

module Mutations
  class OnboardPatient < GraphQL::Schema::Mutation
    description "Register a new patient in the HA system"

    argument :federated_identity, String,  required: true
    argument :first_name,         String,  required: true
    argument :last_name,          String,  required: true
    argument :date_of_birth,      String,  required: true
    argument :sex,                String,  required: false
    argument :blood_type,         String,  required: false
    argument :contact_phone,      String,  required: false
    argument :contact_email,      String,  required: false

    field :patient, Types::PatientType, null: true
    field :errors,  [String],           null: false

    def resolve(**args)
      require_clinician!
      patient = Patient.new(args)
      if patient.save
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
