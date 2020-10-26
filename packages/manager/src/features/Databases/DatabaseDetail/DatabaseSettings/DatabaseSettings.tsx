import * as React from 'react';
import DatabaseSettingsLabelPanel from './DatabaseSettingsLabelPanel';
import DatabaseSettingsMaintenancePanel from './DatabaseSettingsMaintenancePanel';
import DatabaseSettingsPasswordPanel from './DatabaseSettingsPasswordPanel';

interface Props {
  databaseID: number;
  databaseLabel: string;
}

export const DatabaseSettings: React.FC<Props> = props => {
  const { databaseID, databaseLabel } = props;
  return (
    <>
      <DatabaseSettingsLabelPanel
        databaseID={databaseID}
        databaseLabel={databaseLabel}
      />
      <DatabaseSettingsPasswordPanel databaseID={databaseID} />
      <DatabaseSettingsMaintenancePanel
        databaseID={databaseID}
        databaseLabel={databaseLabel}
      />
    </>
  );
};

export default DatabaseSettings;
