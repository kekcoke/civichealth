class CreateClinicalAccounts < ActiveRecord::Migration[7.2]
  def change
    create_table :clinical_accounts, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid    :patient_id,      null: false
      t.decimal :balance,         null: false, precision: 18, scale: 2, default: 0
      t.decimal :total_charges,   null: false, precision: 18, scale: 2, default: 0
      t.decimal :total_payments,  null: false, precision: 18, scale: 2, default: 0
      t.string  :account_status,  limit: 50, default: "ACTIVE"  # ACTIVE, COLLECTIONS, CLOSED
      t.timestamps
    end

    # Transactional triggers for balance consistency enforced at DB level
    add_index :clinical_accounts, :patient_id, unique: true, name: "IX_ClinicalAccounts_PatientId"
    add_foreign_key :clinical_accounts, :patients
  end
end
