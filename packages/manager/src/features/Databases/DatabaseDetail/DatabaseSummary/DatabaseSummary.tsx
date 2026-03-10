import { useDatabaseConnectionPoolsQuery } from '@linode/queries';
import { Paper, Typography } from '@linode/ui';
import Grid from '@mui/material/Grid';
import { styled } from '@mui/material/styles';
import * as React from 'react';

import ClusterConfiguration from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
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

  const hasVPC = Boolean(database?.private_network?.vpc_id);
  const hasPublicVPC = hasVPC && database.private_network?.public_access;

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
        {flags.hostnameEndpoints && showPgBouncerConnectionDetails && (
          <Grid
            size={{
              md: 12,
              sm: 12,
            }}
          >
            <Typography mb={2} variant="h3">
              PgBouncer Connection Details
            </Typography>
            <StyledGridContainer container size={12} spacing={0}>
              <Grid
                size={{
                  md: 2,
                  xs: 3,
                }}
              >
                <StyledLabelTypography>
                  {hasPublicVPC ? 'Public Service URI' : 'Service URI'}
                </StyledLabelTypography>
              </Grid>
              <StyledValueGrid size={{ md: 10, xs: 9 }}>
                <ServiceURI database={database} />
              </StyledValueGrid>
              {hasPublicVPC && (
                <>
                  <Grid
                    size={{
                      md: 2,
                      xs: 3,
                    }}
                  >
                    <StyledLabelTypography>
                      Private Service URI
                    </StyledLabelTypography>
                  </Grid>
                  <StyledValueGrid size={{ md: 10, xs: 9 }}>
                    <ServiceURI database={database} showPrivateVPC />
                  </StyledValueGrid>
                </>
              )}
            </StyledGridContainer>
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
