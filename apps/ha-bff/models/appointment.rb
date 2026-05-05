# frozen_string_literal: true

class Appointment < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient
  belongs_to :provider
  belongs_to :facility, optional: true

  validates :patient_id, :provider_id, :start_time, :end_time, presence: true
  validates :status, inclusion: { in: %w[SCHEDULED COMPLETED CANCELLED NO_SHOW] }
end
