import * as React from 'react';
import { useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import { makeStyles, Theme } from 'src/components/core/styles';
// import Typography from 'src/components/core/Typography';
import ErrorState from 'src/components/ErrorState';
import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AccessControls from './AccessControls';

// import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
// import Divider from 'src/components/core/Divider';
// import CircleProgress from 'src/components/CircleProgress';
// import ErrorState from 'src/components/ErrorState';
// import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
// import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
// import AccessControls from './DatabaseSummaryAccessControls';

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
      <Grid container>
        <Grid item>
          <ClusterConfiguration />
        </Grid>
        <Grid item>
          <ConnectionDetails />
        </Grid>
      </Grid>
      <Divider spacingTop={24} spacingBottom={16} />
      {/*       <Divider className={classes.divider} /> */}
      <AccessControls accessControlsList={accessControlsList} />
    </Paper>
  );
};

export default DatabaseSummary;
