import { useRegionsQuery } from '@linode/queries';
import { Box, TooltipIcon, Typography } from '@linode/ui';
import { convertMegabytesTo, formatStorageUnits } from '@linode/utilities';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
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
  configs: {
    fontSize: '0.875rem',
    lineHeight: '22px',
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  label: {
    font: theme.font.bold,
    lineHeight: '22px',
    width: theme.spacing(13),
  },
  status: {
    alignItems: 'center',
    display: 'flex',
    textTransform: 'capitalize',
  },
}));

interface Props {
  database: Database;
}

/**
 * Deprecated @since DBaaS V2 GA. Will be removed remove post GA release ~ Dec 2024
 * TODO (UIE-8214) remove POST GA
 */
export const DatabaseSummaryClusterConfigurationLegacy = (props: Props) => {
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
      <div className={classes.configs} data-qa-cluster-config>
        <Box display="flex">
          <Typography className={classes.label}>Status</Typography>
          <div className={classes.status}>
            <DatabaseStatusDisplay database={database} events={events} />
          </div>
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Version</Typography>
          <DatabaseEngineVersion
            databaseEngine={database.engine}
            databaseID={database.id}
            databasePendingUpdates={database.updates.pending}
            databasePlatform={database.platform}
            databaseVersion={database.version}
          />
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Nodes</Typography>
          {configuration}
        </Box>
        <Box display="flex" style={{ marginBottom: 12 }}>
          <Typography className={classes.label}>Region</Typography>
          {region?.label ?? database.region}
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Plan</Typography>
          {formatStorageUnits(type.label)}
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>RAM</Typography>
          {type.memory / 1024} GB
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>CPUs</Typography>
          {type.vcpus}
        </Box>
        {database.total_disk_size_gb ? (
          <>
            <Box display="flex">
              <Typography className={classes.label}>Total Disk Size</Typography>
              {database.total_disk_size_gb} GB
              <TooltipIcon
                status="help"
                sxTooltipIcon={sxTooltipIcon}
                text={STORAGE_COPY}
              />
            </Box>
            <Box display="flex">
              <Typography className={classes.label}>Used</Typography>
              {database.used_disk_size_gb} GB
            </Box>
          </>
        ) : (
          <Box display="flex">
            <Typography className={classes.label}>Storage</Typography>
            {convertMegabytesTo(type.disk, true)}
          </Box>
        )}
      </div>
    </>
  );
};

export default DatabaseSummaryClusterConfigurationLegacy;
