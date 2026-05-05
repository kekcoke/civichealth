# frozen_string_literal: true

module Mutations
  class ScheduleAppointment < GraphQL::Schema::Mutation
    description "Book an appointment for a patient with a provider"

    argument :patient_id,        ID,     required: true
    argument :provider_id,       ID,     required: true
    argument :facility_id,       ID,     required: false
    argument :start_time,        String, required: true
    argument :end_time,          String, required: true
    argument :appointment_type,  String, required: false
    argument :notes,             String, required: false

    field :appointment, Types::AppointmentType, null: true
    field :errors,      [String],               null: false

    def resolve(**args)
      appt = Appointment.new(args.merge(status: "SCHEDULED"))
      if appt.save
        { appointment: appt, errors: [] }
      else
        { appointment: nil, errors: appt.errors.full_messages }
      end
    end
  end
end
