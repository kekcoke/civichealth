class CreateProviders < ActiveRecord::Migration[7.2]
  def change
    create_table :providers, id: :uuid, default: -> { "NEWID()" } do |t|
      t.string :first_name,    null: false, limit: 100
      t.string :last_name,     null: false, limit: 100
      t.string :specialty_code, null: false, limit: 50  # Non-clustered index
      t.string :license_number, null: false, limit: 50
      t.string :email,          limit: 255
      t.string :phone,          limit: 20
      t.boolean :is_active,     null: false, default: true
      t.timestamps
    end

    # Non-Clustered index on specialty_code for specialty searches
    add_index :providers, :specialty_code, name: "IX_Providers_SpecialtyCode"
    add_index :providers, :license_number, unique: true, name: "IX_Providers_LicenseNumber"
  end
end
