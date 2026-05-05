# frozen_string_literal: true

require "sinatra/base"
require "sinatra/json"
require "graphql"
require_relative "config/initializers/database"
require_relative "graphql/schema"
require_relative "middleware/phi_sanitizer"
require_relative "lib/audit_logger"

module HaBff
  class App < Sinatra::Base
    # Defence-in-depth: strip PHI from responses for non-ha_clinician callers
    use Middleware::PhiSanitizer
    # ── CORS ────────────────────────────────────────────────────────────────
    before do
      response.headers["Access-Control-Allow-Origin"]  = ENV.fetch("ALLOWED_ORIGIN", "*")
      response.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
      response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    end
    options "*" do 200 end

    # ── JWT Guard ────────────────────────────────────────────────────────────
    before "/api/ha/v1/graphql" do
      auth_header = request.env["HTTP_AUTHORIZATION"]
      halt 401, json(error: "Missing Authorization header") unless auth_header&.start_with?("Bearer ")

      token = auth_header.split(" ", 2).last
      begin
        payload, = JWT.decode(token, ENV.fetch("KEYCLOAK_PUBLIC_KEY"), true, algorithm: "RS256")
        @current_roles = Array(payload.dig("realm_access", "roles"))
        @current_user  = payload["sub"]
      rescue JWT::DecodeError => e
        halt 401, json(error: "Invalid token: #{e.message}")
      end
    end

    # ── GraphQL endpoint ─────────────────────────────────────────────────────
    post "/api/ha/v1/graphql" do
      content_type :json
      body_str = request.body.read
      params   = JSON.parse(body_str)
      result   = HaBff::Schema.execute(
        params["query"],
        variables:      params["variables"] || {},
        context:        { current_user: @current_user, roles: @current_roles },
        operation_name: params["operationName"]
      )
      result.to_json
    end

    # ── Health check ─────────────────────────────────────────────────────────
    get "/health" do
      json status: "ok", service: "ha-bff"
    end
  end
end
