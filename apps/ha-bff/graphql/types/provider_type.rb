# frozen_string_literal: true

module Types
  class ProviderType < GraphQL::Schema::Object
    description "A clinical provider (doctor, nurse, specialist)"

    field :id,             ID,     null: false
    field :first_name,     String, null: false
    field :last_name,      String, null: false
    field :specialty_code, String, null: false
    field :license_number, String, null: false
    field :email,          String, null: true
    field :phone,          String, null: true
    field :is_active,      Boolean, null: false
    field :created_at,     GraphQL::Types::ISO8601DateTime, null: false
  end
end
