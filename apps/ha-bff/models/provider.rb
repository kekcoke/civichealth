# frozen_string_literal: true

class Provider < ActiveRecord::Base
  self.primary_key = "id"

  has_many :appointments
  has_many :encounters
  has_many :medical_records
  has_many :provider_schedules

  validates :first_name, :last_name, :specialty_code, :license_number, presence: true
  validates :license_number, uniqueness: true
end
