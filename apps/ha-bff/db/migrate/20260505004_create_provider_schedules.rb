class CreateProviderSchedules < ActiveRecord::Migration[7.2]
  def change
    create_table :provider_schedules, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid     :provider_id,   null: false
      t.uuid     :facility_id
      t.date     :schedule_date, null: false
      t.time     :start_time,    null: false
      t.time     :end_time,      null: false
      t.string   :shift_type,    limit: 50, default: "REGULAR"  # REGULAR, ON_CALL, EMERGENCY
      t.boolean  :is_available,  null: false, default: true
      t.timestamps
    end

    # Clustered index on (provider_id, schedule_date) for shift lookups
    add_index :provider_schedules, [:provider_id, :schedule_date],
              name: "IX_ProviderSchedules_Provider_Date"
    add_foreign_key :provider_schedules, :providers
    add_foreign_key :provider_schedules, :facilities
  end
end
