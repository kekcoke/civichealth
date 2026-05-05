# frozen_string_literal: true

module Mutations
  class SubmitClaim < GraphQL::Schema::Mutation
    description "Submit an insurance claim for a clinical encounter"

    argument :patient_id,         ID,    required: true
    argument :encounter_id,       ID,    required: true
    argument :insurance_provider, String, required: true
    argument :amount_claimed,     Float,  required: true
    argument :submitted_on,       String, required: false

    field :claim,  Types::ClaimType, null: true
    field :errors, [String],         null: false

    def resolve(**args)
      claim = Claim.new(args.merge(status: "SUBMITTED", submitted_on: args[:submitted_on] || Date.today.to_s))
      if claim.save
        { claim: claim, errors: [] }
      else
        { claim: nil, errors: claim.errors.full_messages }
      end
    end
  end
end
