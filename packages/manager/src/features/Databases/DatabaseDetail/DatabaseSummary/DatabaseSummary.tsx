import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid2';
import * as React from 'react';

import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';

import type { Database } from '@linode/api-v4/lib/databases/types';

interface Props {
  database: Database;
  disabled?: boolean;
}

export const DatabaseSummary: React.FC<Props> = (props) => {
  const { database } = props;

  return (
    <Paper>
      <Grid container spacing={2}>
        <Grid
          size={{
            md: 12,
            sm: 12,
          }}
        >
          <ClusterConfiguration database={database} />
        </Grid>
        <Grid
          size={{
            md: 12,
            sm: 12,
          }}
        >
          <ConnectionDetails database={database} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DatabaseSummary;
