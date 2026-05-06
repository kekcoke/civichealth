# frozen_string_literal: true

ENV["APP_ENV"] ||= "test"

require "spec_helper"
require "factory_bot"
require "webmock/rspec"

WebMock.disable_net_connect!(allow_localhost: true)

Dir[File.join(__dir__, "support", "**", "*.rb")].each { |f| require f }

RSpec.configure do |config|
  config.include FactoryBot::Syntax::Methods

  config.after(:suite) do
    truncate_tables if db_available?
  end
end
