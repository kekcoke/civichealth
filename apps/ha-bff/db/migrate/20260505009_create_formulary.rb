class CreateFormulary < ActiveRecord::Migration[7.2]
  def change
    create_table :formularies, id: :uuid, default: -> { "NEWID()" } do |t|
      t.string  :drug_code,       null: false, limit: 50   # RxNorm / ATC code — Clustered index
      t.string  :brand_name,      null: false, limit: 200
      t.string  :generic_name,    null: false, limit: 200
      t.string  :drug_class,      null: false, limit: 100
      t.string  :dosage_form,     limit: 100   # TABLET, CAPSULE, INJECTION
      t.text    :contraindications
      t.text    :interactions_json  # JSON array of interacting drug_codes
      t.boolean :is_controlled,   null: false, default: false
      t.boolean :is_active,       null: false, default: true
      t.timestamps
    end

    # Clustered index on drug_code for interaction checks
    add_index :formularies, :drug_code, unique: true, name: "IX_Formulary_DrugCode"
    add_index :formularies, :drug_class, name: "IX_Formulary_DrugClass"
  end
end
