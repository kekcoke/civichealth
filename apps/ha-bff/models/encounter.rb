# frozen_string_literal: true

class Encounter < ActiveRecord::Base
  self.primary_key = "id"

  belongs_to :patient
  belongs_to :provider
  belongs_to :facility,       optional: true
  belongs_to :medical_record, optional: true
  has_many   :diagnostics
  has_many   :prescriptions
  has_many   :claims

  validates :patient_id, :provider_id, :encounter_date, presence: true
end
