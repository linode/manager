import { Paper } from '@linode/ui';
import Grid from '@mui/material/Grid';
import * as React from 'react';

import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';

export const DatabaseSummary = () => {
  const { database } = useDatabaseDetailContext();

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
