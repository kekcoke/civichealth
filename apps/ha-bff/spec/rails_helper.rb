# frozen_string_literal: true

ENV["APP_ENV"] ||= "test"

require "spec_helper"
require "factory_bot"
require "webmock/rspec"

WebMock.disable_net_connect!(allow_localhost: true)

Dir[File.join(__dir__, "support", "**", "*.rb")].each { |f| require f }

RSpec.configure do |config|
  config.fixture_path = "#{::Rails.root}/spec/fixtures"
  config.use_transactional_fixtures = false
  config.include FactoryBot::Syntax::Methods

  config.after(:suite) do
    ActiveRecord::Base.connection.execute(
      "TRUNCATE patients, providers, facilities, appointments, encounters, medical_records, diagnostics, prescriptions, claims, consent_directives, clinical_accounts, provider_schedules RESTART IDENTITY CASCADE"
    ) if ActiveRecord::Base.connection.tables.any?
  end
end
