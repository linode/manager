import type { Region } from '@linode/api-v4';
import type {
  Database,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';
import type { Theme } from '@mui/material/styles';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import * as React from 'react';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import {
  StyledGridContainer,
  StyledLabelTypography,
  StyledValueBox,
} from 'src/features/Databases/DatabaseDetail/DatabaseSummary/DatabaseSummaryClusterConfiguration.style';
import { databaseEngineMap } from 'src/features/Databases/DatabaseLanding/DatabaseRow';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useInProgressEvents } from 'src/queries/events/events';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { convertMegabytesTo } from 'src/utilities/unitConversions';
import { makeStyles } from 'tss-react/mui';

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
      ? 'Primary'
      : `Primary +${database.cluster_size - 1} replicas`;

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
      <StyledGridContainer container md={10} spacing={0}>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>Status</StyledLabelTypography>
        </Grid>
        <Grid lg={1.5} md={4} xs={8}>
          <StyledValueBox>
            <DatabaseStatusDisplay database={database} events={events} />
          </StyledValueBox>
        </Grid>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>Plan</StyledLabelTypography>
        </Grid>
        <Grid lg={2.5} md={4} xs={8}>
          <StyledValueBox>{formatStorageUnits(type.label)}</StyledValueBox>
        </Grid>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>Nodes</StyledLabelTypography>
        </Grid>
        <Grid lg={2} md={4} xs={8}>
          <StyledValueBox> {configuration}</StyledValueBox>
        </Grid>
        <Grid lg={1.5} md={2} xs={4}>
          <StyledLabelTypography>CPUs</StyledLabelTypography>
        </Grid>
        <Grid lg={1.5} md={4} xs={8}>
          <StyledValueBox>{type.vcpus}</StyledValueBox>
        </Grid>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>Engine</StyledLabelTypography>
        </Grid>
        <Grid lg={1.5} md={4} xs={8}>
          <StyledValueBox>
            {databaseEngineMap[database.engine]} v{database.version}
          </StyledValueBox>
        </Grid>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>Region</StyledLabelTypography>
        </Grid>
        <Grid lg={2.5} md={4} xs={8}>
          <StyledValueBox>{region?.label ?? database.region}</StyledValueBox>
        </Grid>
        <Grid lg={1} md={2} xs={4}>
          <StyledLabelTypography>RAM</StyledLabelTypography>
        </Grid>
        <Grid lg={2} md={4} xs={8}>
          <StyledValueBox>{type.memory / 1024} GB</StyledValueBox>
        </Grid>
        <Grid lg={1.5} md={2} xs={4}>
          <StyledLabelTypography>
            {database.total_disk_size_gb ? 'Total Disk Size' : 'Storage'}
          </StyledLabelTypography>
        </Grid>
        <Grid lg={1.5} md={4} xs={8}>
          <StyledValueBox>
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
          </StyledValueBox>
        </Grid>
      </StyledGridContainer>
    </>
  );
};

export default DatabaseSummaryClusterConfiguration;
