# frozen_string_literal: true

require "active_record"
require "active_record/connection_adapters/sqlserver_adapter"
require "yaml"
require "erb"

db_config_path = File.expand_path("../database.yml", __dir__)
db_config      = YAML.safe_load(ERB.new(File.read(db_config_path)).result, aliases: true, permitted_classes: [Symbol])
env            = ENV.fetch("APP_ENV", "development")

ActiveRecord::Base.establish_connection(db_config[env])
ActiveRecord::Base.logger = Logger.new($stdout) if env == "development"
