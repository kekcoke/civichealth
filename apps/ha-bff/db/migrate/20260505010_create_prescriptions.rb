class CreatePrescriptions < ActiveRecord::Migration[7.2]
  def change
    create_table :prescriptions, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid   :patient_id,    null: false
      t.uuid   :encounter_id
      t.uuid   :prescribed_by, null: false  # provider_id FK
      t.string :drug_code,     null: false, limit: 50
      t.string :drug_name,     null: false, limit: 200
      t.string :dosage,        null: false, limit: 100
      t.string :frequency,     null: false, limit: 100
      t.integer :duration_days
      t.integer :refills_allowed, default: 0
      t.integer :refills_used,    default: 0
      t.string  :status,          limit: 50, default: "ACTIVE"  # ACTIVE, COMPLETED, CANCELLED, EXPIRED
      t.date    :prescribed_on,   null: false
      t.date    :expires_on
      t.timestamps
    end

    # Temporal Tables for strict audit history — enabled via raw SQL
    # SQL Server: ALTER TABLE prescriptions ADD PERIOD FOR SYSTEM_TIME (...)
    add_index :prescriptions, :patient_id, name: "IX_Prescriptions_PatientId"
    add_index :prescriptions, [:patient_id, :status], name: "IX_Prescriptions_Patient_Status"
    add_foreign_key :prescriptions, :patients
    add_foreign_key :prescriptions, :encounters
  end
end
