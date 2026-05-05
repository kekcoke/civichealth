# frozen_string_literal: true

# Load all types
require_relative "types/provider_type"
require_relative "types/appointment_type"
require_relative "types/encounter_type"
require_relative "types/prescription_type"
require_relative "types/claim_type"
require_relative "types/patient_type"

# Load all mutations
require_relative "mutations/onboard_patient"
require_relative "mutations/update_patient"
require_relative "mutations/update_consent"
require_relative "mutations/schedule_appointment"
require_relative "mutations/cancel_appointment"
require_relative "mutations/create_encounter"
require_relative "mutations/create_lab_order"
require_relative "mutations/submit_claim"

# Load root types (depend on types + mutations above)
require_relative "types/query_type"
require_relative "types/mutation_type"

module HaBff
  class Schema < GraphQL::Schema
    query    Types::QueryType
    mutation Types::MutationType

    # Lazy loading for circular type references
    use GraphQL::Dataloader

    # Maximum query depth to prevent abuse
    max_depth 10

    # PHI guard: rescues auth errors and returns structured GraphQL error
    rescue_from(GraphQL::ExecutionError) { |err, _obj, _args, _ctx, field|
      raise err
    }
  end
end
