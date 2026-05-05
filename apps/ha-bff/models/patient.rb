# frozen_string_literal: true

class Patient < ActiveRecord::Base
  self.primary_key = "id"

  has_one  :clinical_account
  has_many :appointments
  has_many :encounters
  has_many :medical_records
  has_many :diagnostics
  has_many :prescriptions
  has_many :claims
  has_many :consent_directives

  validates :federated_identity, presence: true, uniqueness: true
  validates :first_name, :last_name, :date_of_birth, presence: true
end
