import * as React from 'react';
import { useRouteMatch } from 'react-router-dom';
import useDatabases from 'src/hooks/useDatabases';
import DatabaseSettingsLabelPanel from './DatabaseSettingsLabelPanel';
import DatabaseSettingsMaintenancePanel from './DatabaseSettingsMaintenancePanel';
import DatabaseSettingsPasswordPanel from './DatabaseSettingsPasswordPanel';

export const DatabaseSettings: React.FC<{}> = () => {
  const match = useRouteMatch<{ id: string }>('/databases/:id');
  const databases = useDatabases();

  const thisDatabaseID = match?.params?.id;
  const thisDatabase = databases.databases.itemsById[thisDatabaseID ?? '-1'];

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
