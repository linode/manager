import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import { Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import ConnectionDetails from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryConnectionDetails';
import { useFlags } from 'src/hooks/useFlags';

import { useDatabaseDetailContext } from '../DatabaseDetailContext';
import { ServiceURI } from '../ServiceURI';
import { DatabaseCaCert } from './DatabaseCaCert';

export const DatabaseSummary = () => {
  const { database } = useDatabaseDetailContext();
  const flags = useFlags();

  const { data: connectionPools } = useDatabaseConnectionPoolsQuery(
    database.id,
    flags.databasePgBouncer,
    {}
  );

  const showPgBouncerConnectionDetails =
    flags.databasePgBouncer &&
    database.engine === 'postgresql' &&
    connectionPools &&
    connectionPools.data.length > 0;

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
        {showPgBouncerConnectionDetails && (
          <Grid
            size={{
              md: 12,
              sm: 12,
            }}
          >
            <Typography mb={2} variant="h3">
              PgBouncer Connection Details
            </Typography>
            <ServiceURI database={database} />
          </Grid>
        )}
      </Grid>
      {database.ssl_connection && (
        <StyledButtonCtn>
          <DatabaseCaCert database={database} />
        </StyledButtonCtn>
      )}
    </Paper>
  );
};

export const StyledButtonCtn = styled('div', {
  label: 'StyledButtonCtn',
})(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginTop: '10px',
  padding: `${theme.spacingFunction(8)} 0`,
}));
