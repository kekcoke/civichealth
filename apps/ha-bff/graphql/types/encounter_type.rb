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

    # Vital signs — added by migration 016 (Gap 2 fix)
    field :heart_rate_bpm,       Float, null: true
    field :systolic_bp_mmhg,     Float, null: true
    field :diastolic_bp_mmhg,    Float, null: true
    field :temperature_celsius,  Float, null: true
    field :spo2_percent,         Float, null: true
    field :respiratory_rate_rpm, Float, null: true
    field :weight_kg,            Float, null: true
    field :height_cm,            Float, null: true
  end
end
