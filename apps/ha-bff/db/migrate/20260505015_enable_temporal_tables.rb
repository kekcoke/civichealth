# Temporal Tables for prescriptions provide strict regulatory audit history.
# SQL Server System-Time Temporal Tables track all row versions with timestamps.
class EnableTemporalTables < ActiveRecord::Migration[7.2]
  def up
    execute <<-SQL
      ALTER TABLE prescriptions
      ADD
        ValidFrom DATETIME2 GENERATED ALWAYS AS ROW START NOT NULL DEFAULT SYSUTCDATETIME(),
        ValidTo   DATETIME2 GENERATED ALWAYS AS ROW END   NOT NULL DEFAULT CAST('9999-12-31 23:59:59.9999999' AS DATETIME2);
    SQL

    execute <<-SQL
      ALTER TABLE prescriptions
      ADD PERIOD FOR SYSTEM_TIME (ValidFrom, ValidTo);
    SQL

    execute <<-SQL
      ALTER TABLE prescriptions
      SET (SYSTEM_VERSIONING = ON (
        HISTORY_TABLE = dbo.prescriptions_history,
        DATA_CONSISTENCY_CHECK = ON
      ));
    SQL
  end

  def down
    execute "ALTER TABLE prescriptions SET (SYSTEM_VERSIONING = OFF);"
    execute "ALTER TABLE prescriptions DROP PERIOD FOR SYSTEM_TIME;"
    execute "ALTER TABLE prescriptions DROP COLUMN ValidFrom, DROP COLUMN ValidTo;"
    execute "DROP TABLE IF EXISTS dbo.prescriptions_history;"
  end
end
