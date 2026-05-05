class CreateEncounters < ActiveRecord::Migration[7.2]
  def change
    create_table :encounters, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid     :patient_id,        null: false
      t.uuid     :provider_id,       null: false
      t.uuid     :facility_id
      t.uuid     :medical_record_id
      t.datetime :encounter_date,    null: false
      t.string   :encounter_type,    limit: 50, default: "OUTPATIENT"  # OUTPATIENT, INPATIENT, EMERGENCY, TELEHEALTH
      t.string   :chief_complaint,   limit: 500
      t.string   :status,            limit: 50, default: "OPEN"  # OPEN, CLOSED, BILLED
      # Always Encrypted for sensitive encounter details
      t.text     :encounter_notes_encrypted
      t.timestamps
    end

    # Clustered index on (patient_id, encounter_date) for longitudinal history
    add_index :encounters, [:patient_id, :encounter_date],
              name: "IX_Encounters_Patient_Date"
    add_foreign_key :encounters, :patients
    add_foreign_key :encounters, :providers
    add_foreign_key :encounters, :facilities
    add_foreign_key :encounters, :medical_records
  end
end
