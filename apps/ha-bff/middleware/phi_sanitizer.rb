# frozen_string_literal: true

module Middleware
  # PhiSanitizer — Rack middleware that strips Protected Health Information
  # from GraphQL responses when the requesting JWT lacks the `ha_clinician` role.
  #
  # This is a defence-in-depth layer on top of the resolver-level checks in
  # QueryType. Even if a resolver accidentally leaks a sensitive field, this
  # middleware scrubs it from the serialized response body before it leaves
  # the BFF process.
  #
  # PHI_FIELDS: fields defined as sensitive under HIPAA / RA 10173 (DPA PH).
  # These are stripped for any caller without the `ha_clinician` role.
  PHI_FIELDS = %w[
    clinical_notes_encrypted
    encounter_notes_encrypted
    diagnosis_codes
    sensitivity_level
    clinical_notes
    encounter_notes
    blood_type
    prescriptions
    diagnostics
    claims
    encounters
    medical_records
  ].freeze

  class PhiSanitizer
    def initialize(app)
      @app = app
    end

    def call(env)
      status, headers, body = @app.call(env)

      # Only inspect GraphQL responses
      return [status, headers, body] unless graphql_endpoint?(env)

      roles = extract_roles(env)
      return [status, headers, body] if roles.include?("ha_clinician")

      # Sanitize: rewrite body stripping PHI fields
      sanitized = sanitize_body(body)
      headers["Content-Length"] = sanitized.bytesize.to_s
      [status, headers, [sanitized]]
    end

    private

    def graphql_endpoint?(env)
      env["PATH_INFO"]&.include?("/api/ha/v1/graphql")
    end

    def extract_roles(env)
      auth = env["HTTP_AUTHORIZATION"].to_s
      return [] unless auth.start_with?("Bearer ")

      token = auth.split(" ", 2).last
      payload, = JWT.decode(token, ENV.fetch("KEYCLOAK_PUBLIC_KEY", nil),
                            !ENV["APP_ENV"].nil? && ENV["APP_ENV"] != "test",
                            algorithm: "RS256")
      Array(payload.dig("realm_access", "roles"))
    rescue JWT::DecodeError
      []
    end

    def sanitize_body(body)
      raw = body.respond_to?(:join) ? body.join : body.to_s
      return raw unless raw.start_with?("{") # only process JSON

      data = JSON.parse(raw)
      scrub!(data)
      JSON.generate(data)
    rescue JSON::ParserError
      raw
    end

    def scrub!(obj)
      case obj
      when Hash
        PHI_FIELDS.each { |f| obj.delete(f) }
        obj.each_value { |v| scrub!(v) }
      when Array
        obj.each { |item| scrub!(item) }
      end
    end
  end
end
