# frozen_string_literal: true

require "bundler/setup"
require "rack/test"
require "webmock/rspec"
require "simplecov"

SimpleCov.start do
  add_filter "/spec/"
  minimum_coverage 80
end

require_relative "../app"

ENV["APP_ENV"] = "test"
ENV["KEYCLOAK_PUBLIC_KEY"] = File.read("spec/support/fixtures/keycloak_rsa.pub").strip

RSpec.configure do |config|
  config.include Rack::Test::Methods

  config.before(:suite) do
    truncate_tables if db_available?
  end

  config.before(:each) do
    truncate_tables if db_available?
  end
end

def db_available?
  ActiveRecord::Base.connection.active? rescue false
end

def truncate_tables
  ActiveRecord::Base.connection.execute(
    "TRUNCATE patients, providers, facilities, appointments, encounters, medical_records, diagnostics, prescriptions, claims, consent_directives, clinical_accounts, provider_schedules RESTART IDENTITY CASCADE"
  )
end

def app
  HaBff::App
end

def valid_clinician_token
  JWT.encode(
    { sub: "clinician-001", realm_access: { roles: ["ha_clinician"] }, exp: 1.hour.from_now.to_i },
    OpenSSL::PKey::RSA.new(File.read("spec/support/fixtures/keycloak_rsa.pem")),
    "RS256"
  )
end

def valid_citizen_token(sub: "citizen-001", roles: [])
  JWT.encode(
    { sub: sub, realm_access: { roles: roles }, exp: 1.hour.from_now.to_i },
    OpenSSL::PKey::RSA.new(File.read("spec/support/fixtures/keycloak_rsa.pem")),
    "RS256"
  )
end

def auth_header(token)
  { "HTTP_AUTHORIZATION" => "Bearer #{token}" }
end

def gql(query:, variables: {})
  post "/api/ha/v1/graphql",
       { query: query, variables: variables }.to_json,
       "CONTENT_TYPE" => "application/json"
  JSON.parse(last_response.body)
end
