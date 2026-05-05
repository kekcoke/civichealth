class CreateConsentDirectives < ActiveRecord::Migration[7.2]
  def change
    create_table :consent_directives, id: :uuid, default: -> { "NEWID()" } do |t|
      t.uuid    :patient_id,     null: false
      t.string  :directive_type, null: false, limit: 50  # EMR_SHARE, RESEARCH, MARKETING
      t.boolean :is_granted,     null: false, default: false
      t.string  :granted_to,     limit: 255  # Provider org or third-party system
      t.date    :effective_date, null: false
      t.date    :expiry_date
      t.string  :recorded_by,    limit: 255  # Clinician who recorded consent
      t.text    :notes
      t.timestamps
    end

    # Row-Level Security enforced at SQL Server level (via policy, not migration)
    add_index :consent_directives, :patient_id, name: "IX_ConsentDirectives_PatientId"
    add_index :consent_directives, [:patient_id, :directive_type],
              name: "IX_ConsentDirectives_Patient_Type"
    add_foreign_key :consent_directives, :patients
  end
end
