class CreateClaims < ActiveRecord::Migration[7.2]
  def change
    create_table :claims, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid    :patient_id,         null: false
      t.uuid    :encounter_id,       null: false  # visit_id reference
      t.string  :insurance_provider, null: false, limit: 100
      t.string  :claim_number,       limit: 100
      t.decimal :amount_claimed,     null: false, precision: 18, scale: 2
      t.decimal :amount_approved,    precision: 18, scale: 2
      t.decimal :amount_paid,        precision: 18, scale: 2
      t.string  :status,             limit: 50, default: "SUBMITTED"  # SUBMITTED, APPROVED, DENIED, APPEALED, PAID
      t.date    :submitted_on
      t.date    :adjudicated_on
      t.timestamps
    end

    # Unique constraint: one claim per (visit_id, insurance_provider)
    add_index :claims, [:encounter_id, :insurance_provider],
              unique: true, name: "IX_Claims_Encounter_Provider"
    add_index :claims, :patient_id, name: "IX_Claims_PatientId"
    add_foreign_key :claims, :patients
    add_foreign_key :claims, :encounters
  end
end
