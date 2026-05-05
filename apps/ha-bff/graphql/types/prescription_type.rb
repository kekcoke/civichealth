# frozen_string_literal: true

module Types
  class PrescriptionType < GraphQL::Schema::Object
    description "An active or historical medication prescription"

    field :id,              ID,     null: false
    field :patient_id,      ID,     null: false
    field :drug_code,       String, null: false
    field :drug_name,       String, null: false
    field :dosage,          String, null: false
    field :frequency,       String, null: false
    field :duration_days,   Integer, null: true
    field :refills_allowed, Integer, null: false
    field :refills_used,    Integer, null: false
    field :status,          String,  null: false
    field :prescribed_on,   String,  null: false
    field :expires_on,      String,  null: true
    field :created_at,      GraphQL::Types::ISO8601DateTime, null: false
  end
end
