import * as React from 'react';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import { useParams } from 'react-router-dom';

export const DatabaseSummary: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>();

  const id = Number(databaseId);

  const { data, isLoading, error } = useDatabaseQuery(
    getDatabaseEngine(id),
    id
  );

  if (error) {
    return (
      <ErrorState
        errorText={
          getAPIErrorOrDefault(error, 'Error loading your database.')[0].reason
        }
      />
    );
  }

  if (isLoading) {
    return <CircleProgress />;
  }

  return (
    <>
      <pre>{JSON.stringify(data, undefined, 2)}</pre>
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
