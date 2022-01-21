import { Database } from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import Grid from 'src/components/Grid';
import AccessControls from '../AccessControls';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';

interface Props {
  database: Database;
}

export const DatabaseSummary: React.FC<Props> = (props) => {
  const { database } = props;

  return (
    <Paper>
      <Grid container>
        <Grid item xs={12} sm={4}>
          <ClusterConfiguration database={database} />
        </Grid>
        <Grid item xs={12} sm={8}>
          <ConnectionDetails database={database} />
        </Grid>
      </Grid>
      <Divider spacingTop={28} spacingBottom={16} />
      <AccessControls database={database} />
    </Paper>
  );
};

export default DatabaseSummary;
