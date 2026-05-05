# frozen_string_literal: true

class MedicalRecord < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient
  belongs_to :provider
  has_many   :encounters

  validates :patient_id, :provider_id, :record_type, presence: true
  validates :record_type, inclusion: { in: %w[CONSULTATION LAB IMAGING DISCHARGE] }
end
