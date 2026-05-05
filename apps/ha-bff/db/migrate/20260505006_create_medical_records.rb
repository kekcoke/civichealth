class CreateMedicalRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :medical_records, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid   :patient_id,   null: false
      t.uuid   :provider_id,  null: false
      t.string :record_type,  null: false, limit: 50  # CONSULTATION, LAB, IMAGING, DISCHARGE
      # Always Encrypted fields for sensitive PHI (HIV status, psychiatric notes)
      # Encryption is enforced at the SQL Server column level via Column Master Key
      t.text   :clinical_notes_encrypted   # Always Encrypted
      t.text   :diagnosis_codes            # ICD-10 codes (comma-separated)
      t.string :sensitivity_level, limit: 20, default: "STANDARD"  # STANDARD, SENSITIVE, RESTRICTED
      t.timestamps
    end

    # Columnstore index for longitudinal analysis — created via raw SQL post-migration
    # EF/AR cannot natively create columnstore; use execute() in a subsequent migration
    add_index :medical_records, :patient_id, name: "IX_MedicalRecords_PatientId"
    add_foreign_key :medical_records, :patients
    add_foreign_key :medical_records, :providers
  end
end
