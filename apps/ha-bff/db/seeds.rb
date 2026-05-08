# frozen_string_literal: true

# Seeds for CivicHealth HA-BFF Development
# Run with: rake db:seed
#
# This file creates test users and healthcare providers for local development.
# All users share the same password: DevP@ssw0rd!2026
#
# IMPORTANT: This is for LOCAL DEVELOPMENT ONLY.
# Do not run this in production or staging environments.

require 'bcrypt'

puts '🌱 Seeding HA-BFF database...'

# ─────────────────────────────────────────────────────────────────────────────
# PATIENTS (Local Residents - have both CivicApi and HA-BFF records)
# ─────────────────────────────────────────────────────────────────────────────

patients = [
  {
    federated_identity: '07c70a5f-75de-43d9-8eb8-d9891f67dbf2',
    first_name: 'Maria',
    last_name: 'Santos',
    date_of_birth: '1985-03-15',
    sex: 'F',
    blood_type: 'A+',
    contact_phone: '+1-555-0101',
    contact_email: 'maria.santos@civichealth.local'
  },
  {
    federated_identity: 'a214faa7-f476-458e-86bb-82d8923a8183',
    first_name: 'Juan',
    last_name: 'Cruz',
    date_of_birth: '1990-07-22',
    sex: 'M',
    blood_type: 'O+',
    contact_phone: '+1-555-0102',
    contact_email: 'juan.cruz@civichealth.local'
  },
  {
    federated_identity: '814f0582-2660-4331-8de6-6b5efb4741e9',
    first_name: 'Elena',
    last_name: 'Reyes',
    date_of_birth: '1988-11-08',
    sex: 'F',
    blood_type: 'B+',
    contact_phone: '+1-555-0103',
    contact_email: 'elena.reyes@civichealth.local'
  }
]

# ─────────────────────────────────────────────────────────────────────────────
# NON-RESIDENT PATIENTS (HA-BFF only - no CivicApi record)
# ─────────────────────────────────────────────────────────────────────────────

non_resident_patients = [
  {
    federated_identity: 'ce10149c-f4dc-4222-ad51-6a6c0fde6745',
    first_name: 'Hiroshi',
    last_name: 'Tanaka',
    date_of_birth: '1995-04-30',
    sex: 'M',
    blood_type: 'AB',
    contact_phone: '+81-90-5555-0104',
    contact_email: 'h.tanaka@email.jp'
  },
  {
    federated_identity: 'f913a4c3-3fe3-4e8c-9d24-204549886b56',
    first_name: 'Sofia',
    last_name: 'Mendez',
    date_of_birth: '1992-09-14',
    sex: 'F',
    blood_type: 'O-',
    contact_phone: '+52-55-5555-0105',
    contact_email: 'sofia.mendez@email.mx'
  }
]

# ─────────────────────────────────────────────────────────────────────────────
# PROVIDERS (Healthcare Workers)
# ─────────────────────────────────────────────────────────────────────────────

providers = [
  {
    first_name: 'Antonio',
    last_name: 'Kim',
    specialty_code: 'GP',
    license_number: 'MD-2024-001',
    email: 'dr.kim@civichealth.local',
    phone: '+1-555-0201',
    is_active: true
  },
  {
    first_name: 'Patricia',
    last_name: 'Wong',
    specialty_code: 'CARDIO',
    license_number: 'MD-2024-002',
    email: 'dr.wong@civichealth.local',
    phone: '+1-555-0202',
    is_active: true
  },
  {
    first_name: 'Roberto',
    last_name: 'Dela Cruz',
    specialty_code: 'PEDIA',
    license_number: 'MD-2024-003',
    email: 'dr.delacruz@civichealth.local',
    phone: '+1-555-0203',
    is_active: true
  }
]

# ─────────────────────────────────────────────────────────────────────────────
# FACILITIES
# ─────────────────────────────────────────────────────────────────────────────

facilities = [
  {
    name: 'CivicHealth Main Hospital',
    code: 'CHMH',
    facility_type: 'HOSPITAL',
    address: '123 Quezon Avenue, Quezon City',
    phone: '+1-555-1000',
    is_active: true
  },
  {
    name: 'Barangay Health Center - Central',
    code: 'BHC-C',
    facility_type: 'CLINIC',
    address: '456 Barangay Central, Quezon City',
    phone: '+1-555-1001',
    is_active: true
  }
]

# ─────────────────────────────────────────────────────────────────────────────
# CREATE RECORDS
# ─────────────────────────────────────────────────────────────────────────────

# Create Local Resident Patients
puts '👤 Creating local resident patients...'
patients.each do |p|
  patient = Patient.find_or_initialize_by(federated_identity: p[:federated_identity])
  patient.assign_attributes(p)
  
  if patient.new_record?
    patient.save!
    puts "  ✓ Created patient: #{patient.full_name}"
  else
    puts "  → Patient exists: #{patient.full_name}"
  end
end

# Create Non-Resident Patients
puts '🌍 Creating non-resident patients...'
non_resident_patients.each do |p|
  patient = Patient.find_or_initialize_by(federated_identity: p[:federated_identity])
  patient.assign_attributes(p)
  
  if patient.new_record?
    patient.save!
    puts "  ✓ Created non-resident: #{patient.full_name}"
  else
    puts "  → Non-resident exists: #{patient.full_name}"
  end
end

# Create Providers
puts '👨‍⚕️ Creating healthcare providers...'
providers.each do |p|
  provider = Provider.find_or_initialize_by(license_number: p[:license_number])
  provider.assign_attributes(p)
  
  if provider.new_record?
    provider.save!
    puts "  ✓ Created provider: Dr. #{provider.full_name} (#{provider.specialty_code})"
  else
    puts "  → Provider exists: Dr. #{provider.full_name}"
  end
end

# Create Facilities
puts '🏥 Creating facilities...'
facilities.each do |f|
  facility = Facility.find_or_initialize_by(code: f[:code])
  facility.assign_attributes(f)
  
  if facility.new_record?
    facility.save!
    puts "  ✓ Created facility: #{facility.name}"
  else
    puts "  → Facility exists: #{facility.name}"
  end
end

# ─────────────────────────────────────────────────────────────────────────────
# CREATE SAMPLE ENCOUNTERS (for testing)
# ─────────────────────────────────────────────────────────────────────────────

puts '📋 Creating sample encounters...'
maria = Patient.find_by(federated_identity: '07c70a5f-75de-43d9-8eb8-d9891f67dbf2')
juan = Patient.find_by(federated_identity: 'a214faa7-f476-458e-86bb-82d8923a8183')
dr_kim = Provider.find_by(license_number: 'MD-2024-001')
main_hospital = Facility.find_by(code: 'CHMH')

if maria && dr_kim
  encounter = Encounter.find_or_initialize_by(
    patient_id: maria.id,
    provider_id: dr_kim.id,
    encounter_date: 7.days.ago
  )
  encounter.assign_attributes(
    facility_id: main_hospital&.id,
    encounter_type: 'OUTPATIENT',
    chief_complaint: 'Annual checkup',
    status: 'CLOSED'
  )
  if encounter.new_record?
    encounter.save!
    puts "  ✓ Created encounter for Maria Santos"
  end
end

if juan && dr_kim
  encounter = Encounter.find_or_initialize_by(
    patient_id: juan.id,
    provider_id: dr_kim.id,
    encounter_date: 3.days.ago
  )
  encounter.assign_attributes(
    facility_id: main_hospital&.id,
    encounter_type: 'OUTPATIENT',
    chief_complaint: 'Follow-up consultation',
    status: 'OPEN'
  )
  if encounter.new_record?
    encounter.save!
    puts "  ✓ Created encounter for Juan Cruz"
  end
end

puts '✅ Seed completed successfully!'
puts ''
puts '📋 Test Users:'
puts '  Password for all: DevP@ssw0rd!2026'
puts ''
puts '  Local Residents (have Civic + HA access):'
puts '    - Maria Santos (admin)     maria.santos@civichealth.local'
puts '    - Juan Cruz                juan.cruz@civichealth.local'
puts '    - Elena Reyes             elena.reyes@civichealth.local'
puts ''
puts '  Non-Residents (HA only):'
puts '    - Hiroshi Tanaka          h.tanaka@email.jp (tourist)'
puts '    - Sofia Mendez            sofia.mendez@email.mx (temp worker)'
