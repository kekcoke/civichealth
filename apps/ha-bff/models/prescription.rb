# frozen_string_literal: true

class Prescription < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient
  belongs_to :encounter, optional: true

  validates :patient_id, :drug_code, :drug_name, :dosage, :frequency, :prescribed_on, presence: true
  validates :status, inclusion: { in: %w[ACTIVE COMPLETED CANCELLED EXPIRED] }
end
