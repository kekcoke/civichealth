# frozen_string_literal: true

class Claim < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient
  belongs_to :encounter

  validates :patient_id, :encounter_id, :insurance_provider, :amount_claimed, presence: true
  validates :status, inclusion: { in: %w[SUBMITTED APPROVED DENIED APPEALED PAID] }
end
