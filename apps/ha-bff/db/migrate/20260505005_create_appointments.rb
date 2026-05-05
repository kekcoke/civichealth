class CreateAppointments < ActiveRecord::Migration[7.2]
  def change
    create_table :appointments, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid     :patient_id,   null: false
      t.uuid     :provider_id,  null: false
      t.uuid     :facility_id
      t.datetime :start_time,   null: false
      t.datetime :end_time,     null: false
      t.string   :appointment_type, limit: 50, default: "CONSULTATION"
      t.string   :status,       limit: 50, default: "SCHEDULED"  # SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
      t.text     :notes
      t.timestamps
    end

    # Non-Clustered index on (provider_id, start_time) for provider schedule queries
    add_index :appointments, [:provider_id, :start_time],
              name: "IX_Appointments_Provider_StartTime"
    add_index :appointments, :patient_id, name: "IX_Appointments_PatientId"
    add_foreign_key :appointments, :patients
    add_foreign_key :appointments, :providers
    add_foreign_key :appointments, :facilities
  end
end
