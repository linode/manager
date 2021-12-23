import * as React from 'react';
import { useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AccessControls from './AccessControls';

// import useDatabases from 'src/hooks/useDatabases';
// import DatabaseSummaryLabelPanel from './DatabaseSummaryLabelPanel';
// import DatabaseSummaryMaintenancePanel from './DatabaseSummaryMaintenancePanel';
// import DatabaseSummaryPasswordPanel from './DatabaseSummaryPasswordPanel';

const useStyles = makeStyles((theme: Theme) => ({
  divider: {
    marginTop: '1.5rem',
    marginBottom: '1rem',
  },
}));

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

export const DatabaseSummary: React.FC = () => {
  const classes = useStyles();

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

  const accessControlsList = data?.allow_list ?? [];

  return (
    <Paper>
      <Typography variant="h3">Cluster Configuration</Typography>
      <Typography variant="h3">Connection Details</Typography>
      <Divider className={classes.divider} />
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
      <AccessControls accessControlsList={accessControlsList} />
    </Paper>
  );
};

export default DatabaseSummary;
