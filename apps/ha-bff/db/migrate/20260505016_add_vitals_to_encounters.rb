class AddVitalsToEncounters < ActiveRecord::Migration[7.2]
  def change
    change_table :encounters, bulk: true do |t|
      # Vital signs — stored as decimals for precision; nullable (not always recorded)
      t.decimal :heart_rate_bpm,      precision: 6, scale: 1, null: true, comment: "Heart rate in beats per minute"
      t.decimal :systolic_bp_mmhg,    precision: 5, scale: 1, null: true, comment: "Systolic blood pressure mmHg"
      t.decimal :diastolic_bp_mmhg,   precision: 5, scale: 1, null: true, comment: "Diastolic blood pressure mmHg"
      t.decimal :temperature_celsius,  precision: 5, scale: 2, null: true, comment: "Body temperature in Celsius"
      t.decimal :spo2_percent,         precision: 5, scale: 2, null: true, comment: "Peripheral oxygen saturation %"
      t.decimal :respiratory_rate_rpm, precision: 5, scale: 1, null: true, comment: "Respiratory rate breaths/min"
      t.decimal :weight_kg,            precision: 6, scale: 2, null: true, comment: "Patient weight in kg"
      t.decimal :height_cm,            precision: 5, scale: 1, null: true, comment: "Patient height in cm"
    end

    # Partial index — only rows where vitals were actually recorded
    add_index :encounters, :heart_rate_bpm,
              name: "idx_encounters_vitals_recorded",
              where: "heart_rate_bpm IS NOT NULL"
  end
end
