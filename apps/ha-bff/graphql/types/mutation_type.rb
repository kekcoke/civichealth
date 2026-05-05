# frozen_string_literal: true

module Types
  class MutationType < GraphQL::Schema::Object
    description "HA BFF GraphQL Mutations — require ha_clinician role"

    field :onboard_patient,       mutation: Mutations::OnboardPatient
    field :update_patient,        mutation: Mutations::UpdatePatient
    field :update_consent,             mutation: Mutations::UpdateConsent
    field :update_consent_directives,  mutation: Mutations::UpdateConsentDirectives
    field :schedule_appointment,  mutation: Mutations::ScheduleAppointment
    field :cancel_appointment,    mutation: Mutations::CancelAppointment
    field :create_encounter,      mutation: Mutations::CreateEncounter
    field :create_lab_order,      mutation: Mutations::CreateLabOrder
    field :submit_claim,          mutation: Mutations::SubmitClaim
  end
end
