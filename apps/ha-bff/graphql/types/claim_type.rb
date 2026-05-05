# frozen_string_literal: true

module Types
  class ClaimType < GraphQL::Schema::Object
    description "An insurance claim filed against a clinical encounter"

    field :id,                 ID,     null: false
    field :patient_id,         ID,     null: false
    field :encounter_id,       ID,     null: false
    field :insurance_provider, String, null: false
    field :claim_number,       String, null: true
    field :amount_claimed,     Float,  null: false
    field :amount_approved,    Float,  null: true
    field :amount_paid,        Float,  null: true
    field :status,             String, null: false
    field :submitted_on,       String, null: true
    field :adjudicated_on,     String, null: true
    field :created_at,         GraphQL::Types::ISO8601DateTime, null: false
  end
end
