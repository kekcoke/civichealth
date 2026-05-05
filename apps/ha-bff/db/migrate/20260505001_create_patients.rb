class CreatePatients < ActiveRecord::Migration[7.2]
  def change
    create_table :patients, id: :uuid, default: -> { "NEWID()" } do |t|
      # Federated identity from Keycloak OIDC broker (links to LGU CitizenId)
      t.string :federated_identity, null: false, limit: 36
      t.string :first_name,         null: false, limit: 100
      t.string :last_name,          null: false, limit: 100
      t.string :date_of_birth,      null: false, limit: 10
      t.string :sex,                limit: 10
      t.string :blood_type,         limit: 5
      t.string :contact_phone,      limit: 20
      t.string :contact_email,      limit: 255
      t.timestamps
    end

    # Clustered index on patient_id (primary key — default in SQL Server)
    add_index :patients, :federated_identity, unique: true, name: "IX_Patients_FederatedIdentity"
  end
end
