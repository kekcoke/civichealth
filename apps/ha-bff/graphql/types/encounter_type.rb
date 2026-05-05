# frozen_string_literal: true

module Types
  class EncounterType < GraphQL::Schema::Object
    description "An actual clinical visit"

    field :id,               ID,     null: false
    field :patient_id,       ID,     null: false
    field :provider_id,      ID,     null: false
    field :encounter_date,   GraphQL::Types::ISO8601DateTime, null: false
    field :encounter_type,   String, null: false
    field :chief_complaint,  String, null: true
    field :status,           String, null: false
    field :created_at,       GraphQL::Types::ISO8601DateTime, null: false
  end
end
