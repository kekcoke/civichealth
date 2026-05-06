# frozen_string_literal: true

require "factory_bot"

FactoryBot.define do
  sequence(:federated_identity) { |n| "oidc-uuid-#{n}-#{SecureRandom.uuid}" }

  factory :patient do
    federated_identity
    first_name { "Jane" }
    last_name  { "Doe" }
    date_of_birth { 30.years.ago.to_date }
    contact_phone { "09171234567" }
    sensitivity_level { "NORMAL" }
    clinical_notes_encrypted { nil }
  end

  factory :provider do
    first_name { "John" }
    last_name  { "Smith" }
    specialty_code { "GENERAL" }
    license_number { |n| "LICENSE-#{n}" }
    is_active { true }
  end

  factory :appointment do
    association :patient
    association :provider
    start_time { 1.week.from_now }
    end_time   { 1.week.from_now + 30.minutes }
    status     { "SCHEDULED" }
    facility_id { 1 }
  end

  factory :encounter do
    association :patient
    encounter_type { "OUTPATIENT" }
    encounter_date { Date.today }
    chief_complaint { "Follow-up" }
    heart_rate { 72 }
    systolic_bp { 120 }
    diastolic_bp { 80 }
    temperature { 36.8 }
    spo2 { 98 }
    respiratory_rate { 16 }
    weight { 70.0 }
    height { 170.0 }
  end

  factory :consent_directive do
    association :patient
    directive_type { "SHARE_ALL_CLINICS" }
    is_granted { true }
    effective_date { Date.today }
    recorded_by { "ha_clinician" }
  end

  factory :claim do
    association :patient
    association :provider
    status { "PENDING" }
    amount { 500.00 }
  end
end
