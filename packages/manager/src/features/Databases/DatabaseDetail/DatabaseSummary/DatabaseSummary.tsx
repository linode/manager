import * as React from 'react';
import { useParams } from 'react-router-dom';

import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import Divider from 'src/components/core/Divider';
import CircleProgress from 'src/components/CircleProgress';
import ErrorState from 'src/components/ErrorState';
import { useDatabaseQuery } from 'src/queries/databases';
import { getAPIErrorOrDefault } from 'src/utilities/errorUtils';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import AccessControls from './DatabaseSummaryAccessControls';

export const DatabaseSummary: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>();

  const id = Number(databaseId);

  const { data, isLoading, error } = useDatabaseQuery(id);

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
      <AccessControls />
    </Paper>
  );
};

export default DatabaseSummary;
