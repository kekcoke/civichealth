# frozen_string_literal: true

module Lib
  # AuditLogger — mirrors the SQL Server `audit_clinical_access` trigger requirement.
  # Logs every GraphQL query that touches MedicalRecords or Encounters to a
  # dedicated audit table (or structured log stream) for compliance.
  #
  # Usage: call AuditLogger.log(context, operation) inside resolvers.
  class AuditLogger
    AUDITED_OPERATIONS = %w[
      getPatientRecord
      listEncounters
      getLabResults
      getActivePrescriptions
    ].freeze

    def self.log(context, operation_name, patient_id: nil)
      return unless AUDITED_OPERATIONS.include?(operation_name)

      entry = {
        timestamp:      Time.now.utc.iso8601,
        operation:      operation_name,
        physician_id:   context[:current_user],
        roles:          context[:roles],
        patient_id:     patient_id,
        ip_address:     context[:ip_address],
        compliant:      context[:roles]&.include?("ha_clinician") || false
      }

      # Write to structured log — in production, ship to SIEM / Azure Monitor
      logger.info(JSON.generate(entry))
    end

    def self.logger
      @logger ||= Logger.new($stdout).tap do |l|
        l.formatter = proc { |_sev, _dt, _prog, msg| "#{msg}\n" }
      end
    end
  end
end
