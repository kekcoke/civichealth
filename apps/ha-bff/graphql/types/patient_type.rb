# frozen_string_literal: true

module Types
  class PatientType < GraphQL::Schema::Object
    description "A registered patient in the Health Authority system"

    field :id,                  ID,     null: false
    field :federated_identity,  String, null: false, description: "Links to LGU CitizenId via Keycloak OIDC"
    field :first_name,          String, null: false
    field :last_name,           String, null: false
    field :date_of_birth,       String, null: false
    field :sex,                 String, null: true
    field :blood_type,          String, null: true
    field :contact_phone,       String, null: true
    field :contact_email,       String, null: true
    field :created_at,          GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at,          GraphQL::Types::ISO8601DateTime, null: false

    field :appointments,   [Types::AppointmentType],   null: false
    field :prescriptions,  [Types::PrescriptionType],  null: false
    field :encounters,     [Types::EncounterType],     null: false
  end
end
