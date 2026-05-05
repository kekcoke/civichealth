# frozen_string_literal: true

module Mutations
  class CancelAppointment < GraphQL::Schema::Mutation
    description "Cancel a scheduled appointment"

    argument :id, ID, required: true

    field :appointment, Types::AppointmentType, null: true
    field :errors,      [String],               null: false

    def resolve(id:)
      appt = Appointment.find_by(id: id)
      return { appointment: nil, errors: ["Appointment not found"] } unless appt
      return { appointment: nil, errors: ["Only SCHEDULED appointments can be cancelled"] } unless appt.status == "SCHEDULED"

      appt.update!(status: "CANCELLED")
      { appointment: appt, errors: [] }
    end
  end
end
