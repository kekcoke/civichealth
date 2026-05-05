class CreateFacilities < ActiveRecord::Migration[7.2]
  def change
    create_table :facilities, id: :uuid, default: -> { "NEWID()" } do |t|
      t.string  :name,        null: false, limit: 200
      t.string  :type_code,   null: false, limit: 50   # CLINIC, WING, ROOM
      t.uuid    :parent_id                              # Hierarchical: wing belongs to clinic
      t.string  :floor,       limit: 20
      t.integer :capacity
      t.boolean :is_active,   null: false, default: true
      t.timestamps
    end

    # Hierarchical/spatial index for facility lookup
    add_index :facilities, :parent_id,  name: "IX_Facilities_ParentId"
    add_index :facilities, :type_code,  name: "IX_Facilities_TypeCode"
  end
end
