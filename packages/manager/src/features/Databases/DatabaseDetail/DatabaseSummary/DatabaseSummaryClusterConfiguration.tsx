import { useRegionsQuery } from '@linode/queries';
import { TooltipIcon, Typography } from '@linode/ui';
import { convertMegabytesTo, formatStorageUnits } from '@linode/utilities';
import Grid from '@mui/material/Grid2';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueGrid,
} from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useInProgressEvents } from 'src/queries/events/events';

import type { Region } from '@linode/api-v4';
import type {
  Database,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';
import type { Theme } from '@mui/material/styles';

const useStyles = makeStyles()((theme: Theme) => ({
  header: {
    marginBottom: theme.spacing(2),
  },
}));

interface Props {
  database: Database;
}

export const DatabaseSummaryClusterConfiguration = (props: Props) => {
  const { classes } = useStyles();
  const { database } = props;

  const { data: types } = useDatabaseTypesQuery({
    platform: database.platform,
  });

  const type = types?.find((type: DatabaseType) => type.id === database?.type);

  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r: Region) => r.id === database.region);

  const { data: events } = useInProgressEvents();

  if (!database || !type) {
    return null;
  }

  const configuration =
    database.cluster_size === 1
      ? 'Primary (1 Node)'
      : database.cluster_size > 2
      ? `Primary (+${database.cluster_size - 1} Nodes)`
      : `Primary (+${database.cluster_size - 1} Node)`;

  const sxTooltipIcon = {
    marginLeft: '4px',
    padding: '0px',
  };

  const STORAGE_COPY =
    'The total disk size is smaller than the selected plan capacity due to overhead from the OS.';

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Cluster Configuration
      </Typography>
      <StyledGridContainer container size={{ md: 11 }} spacing={0}>
        <Grid
          size={{
            lg: 1,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>Status</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 2, md: 4, xs: 8 }}>
          <DatabaseStatusDisplay database={database} events={events} />
        </StyledValueGrid>
        <Grid
          size={{
            lg: 0.9,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>Plan</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 2.2, md: 4, xs: 8 }}>
          {formatStorageUnits(type.label)}
        </StyledValueGrid>
        <Grid
          size={{
            lg: 1,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>Nodes</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 1.7, md: 4, xs: 8 }}>
          {configuration}
        </StyledValueGrid>
        <Grid
          size={{
            lg: 1.7,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>CPUs</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 1.5, md: 4, xs: 8 }}>
          {type.vcpus}
        </StyledValueGrid>
        <Grid
          size={{
            lg: 1,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>Engine</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 2, md: 4, xs: 8 }}>
          <DatabaseEngineVersion
            databaseEngine={database.engine}
            databaseID={database.id}
            databasePendingUpdates={database.updates.pending}
            databasePlatform={database.platform}
            databaseVersion={database.version}
          />
        </StyledValueGrid>
        <Grid
          size={{
            lg: 0.9,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>Region</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 2.2, md: 4, xs: 8 }}>
          {region?.label ?? database.region}
        </StyledValueGrid>
        <Grid
          size={{
            lg: 1,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>RAM</StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 1.7, md: 4, xs: 8 }}>
          {type.memory / 1024} GB
        </StyledValueGrid>
        <Grid
          size={{
            lg: 1.7,
            md: 2,
            xs: 4,
          }}
        >
          <StyledLabelTypography>
            {database.total_disk_size_gb ? 'Total Disk Size' : 'Storage'}
          </StyledLabelTypography>
        </Grid>
        <StyledValueGrid size={{ lg: 1.5, md: 4, xs: 8 }}>
          {database.total_disk_size_gb ? (
            <>
              {database.total_disk_size_gb} GB
              <TooltipIcon
                status="help"
                sxTooltipIcon={sxTooltipIcon}
                text={STORAGE_COPY}
              />
            </>
          ) : (
            convertMegabytesTo(type.disk, true)
          )}
        </StyledValueGrid>
      </StyledGridContainer>
    </>
  );
};

export default DatabaseSummaryClusterConfiguration;
