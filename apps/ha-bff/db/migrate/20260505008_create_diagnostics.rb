class CreateDiagnostics < ActiveRecord::Migration[7.2]
  def change
    create_table :diagnostics, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid   :patient_id,     null: false
      t.uuid   :encounter_id
      t.uuid   :ordered_by,     null: false  # provider_id FK
      t.string :diagnostic_type, null: false, limit: 50  # LAB, IMAGING, PATHOLOGY
      t.string :test_code,       null: false, limit: 100  # LOINC code
      t.string :test_name,       null: false, limit: 200
      t.text   :results
      t.string :result_status,   limit: 50, default: "PENDING"  # PENDING, RESULTED, REVIEWED
      t.string :imaging_url,     limit: 500  # Pointer to PACS/image store
      t.datetime :resulted_at
      t.timestamps
    end

    # Columnstore index for epidemiological analytics — added via execute in a follow-up migration
    add_index :diagnostics, :patient_id, name: "IX_Diagnostics_PatientId"
    add_index :diagnostics, :test_code,  name: "IX_Diagnostics_TestCode"
    add_foreign_key :diagnostics, :patients
    add_foreign_key :diagnostics, :encounters
  end
end
