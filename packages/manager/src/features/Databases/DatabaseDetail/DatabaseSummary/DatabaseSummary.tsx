import * as React from 'react';
// import useDatabases from 'src/hooks/useDatabases';
// import DatabaseSummaryLabelPanel from './DatabaseSummaryLabelPanel';
// import DatabaseSummaryMaintenancePanel from './DatabaseSummaryMaintenancePanel';
// import DatabaseSummaryPasswordPanel from './DatabaseSummaryPasswordPanel';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const DatabaseSummary: React.FC<Props> = (props) => {
  // const databases = useDatabases();
  // const { databaseID } = props;
  // const thisDatabase = databases.databases.itemsById[databaseID];

  return (
    <>
      Database Summary
      {/* <DatabaseSummaryLabelPanel
        databaseID={thisDatabase.id}
        databaseLabel={thisDatabase.label}
      />
      <DatabaseSummaryPasswordPanel databaseID={thisDatabase.id} />
      <DatabaseSummaryMaintenancePanel
        databaseID={thisDatabase.id}
        databaseMaintenanceSchedule={thisDatabase.maintenance_schedule}
      /> */}
    </>
  );
};

export default DatabaseSummary;
