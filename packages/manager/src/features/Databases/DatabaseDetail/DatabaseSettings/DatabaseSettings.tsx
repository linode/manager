import * as React from 'react';
import useDatabases from 'src/hooks/useDatabases';
import DatabaseSettingsLabelPanel from './DatabaseSettingsLabelPanel';
import DatabaseSettingsMaintenancePanel from './DatabaseSettingsMaintenancePanel';
import DatabaseSettingsPasswordPanel from './DatabaseSettingsPasswordPanel';

interface Props {
  databaseID: number;
}

export const DatabaseSettings: React.FC<Props> = (props) => {
  const databases = useDatabases();

  const { databaseID } = props;

  const thisDatabase = databases.databases.itemsById[databaseID];

  return (
    <>
      <DatabaseSettingsLabelPanel
        databaseID={thisDatabase.id}
        databaseLabel={thisDatabase.label}
      />
      <DatabaseSettingsPasswordPanel databaseID={thisDatabase.id} />
      <DatabaseSettingsMaintenancePanel
        databaseID={thisDatabase.id}
        databaseMaintenanceSchedule={thisDatabase.maintenance_schedule}
      />
    </>
  );
};

export default DatabaseSettings;
