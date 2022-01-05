import * as React from 'react';
import { useParams } from 'react-router-dom';
import CircleProgress from 'src/components/CircleProgress';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import ErrorState from 'src/components/ErrorState';
import Grid from 'src/components/Grid';
import { getDatabaseEngine, useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import AccessControls from './AccessControls';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {
  // databaseID: number;
}

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
    <Paper>
      <Grid container>
        <Grid item>
          <ClusterConfiguration />
        </Grid>
        <Grid item>
          <ConnectionDetails />
        </Grid>
      </Grid>
      <Divider spacingTop={24} spacingBottom={16} />
      <AccessControls databaseData={data} />
    </Paper>
  );
};

export default DatabaseSummary;
