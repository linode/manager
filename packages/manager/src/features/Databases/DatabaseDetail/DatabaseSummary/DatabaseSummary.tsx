import { Database } from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import Paper from 'src/components/core/Paper';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import AccessControls from '../AccessControls';
import ClusterConfiguration from './DatabaseSummaryClusterConfiguration';
import ConnectionDetails from './DatabaseSummaryConnectionDetails';

interface Props {
  database: Database;
}

export const DatabaseSummary: React.FC<Props> = (props) => {
  const { database } = props;

  const description = (
    <>
      <Typography>
        Add IPv4 addresses or ranges that should be authorized to access this
        cluster. All other public and private connections are denied.{' '}
        <Link to="https://www.linode.com/docs/products/databases/managed-databases/guides/manage-access-controls/">
          Learn more
        </Link>
        .
      </Typography>
      <Typography style={{ marginTop: 12 }}>
        You can add or modify access controls after your database cluster is
        active.
      </Typography>
    </>
  );

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
      <AccessControls database={database} description={description} />
    </Paper>
  );
};

export default DatabaseSummary;
