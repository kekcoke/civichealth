# Columnstore indexes cannot be created via standard ActiveRecord DSL.
# This migration uses raw SQL to add them post-table creation.
class AddColumnstoreIndexes < ActiveRecord::Migration[7.2]
  def up
    # Columnstore index on medical_records for longitudinal patient analysis
    execute <<-SQL
      CREATE NONCLUSTERED COLUMNSTORE INDEX NCCI_MedicalRecords_Longitudinal
      ON medical_records (patient_id, record_type, created_at, updated_at);
    SQL

    # Columnstore index on diagnostics for epidemiological analytics
    execute <<-SQL
      CREATE NONCLUSTERED COLUMNSTORE INDEX NCCI_Diagnostics_Epidemiological
      ON diagnostics (patient_id, diagnostic_type, test_code, resulted_at, created_at);
    SQL
  end

  def down
    execute "DROP INDEX NCCI_MedicalRecords_Longitudinal ON medical_records;"
    execute "DROP INDEX NCCI_Diagnostics_Epidemiological ON diagnostics;"
  end
end
