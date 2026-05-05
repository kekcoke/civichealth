# frozen_string_literal: true

module Types
  class AppointmentType < GraphQL::Schema::Object
    description "A pre-visit appointment between a patient and provider"

    field :id,               ID,     null: false
    field :patient_id,       ID,     null: false
    field :provider_id,      ID,     null: false
    field :facility_id,      ID,     null: true
    field :start_time,       GraphQL::Types::ISO8601DateTime, null: false
    field :end_time,         GraphQL::Types::ISO8601DateTime, null: false
    field :appointment_type, String, null: false
    field :status,           String, null: false
    field :notes,            String, null: true
    field :created_at,       GraphQL::Types::ISO8601DateTime, null: false

    field :provider, Types::ProviderType, null: false
  end
end
