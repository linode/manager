import { Database, DatabaseInstance } from '@linode/api-v4/lib/databases/types';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { makeStyles } from 'tss-react/mui';

import { Box } from 'src/components/Box';
import { StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';
import { useDatabaseTypesQuery } from 'src/queries/databases';
import { useRegionsQuery } from 'src/queries/regions';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';
import { convertMegabytesTo } from 'src/utilities/unitConversions';

import {
  databaseEngineMap,
  databaseStatusMap,
} from '../../DatabaseLanding/DatabaseRow';

const useStyles = makeStyles()((theme: Theme) => ({
  configs: {
    fontSize: '0.875rem',
    lineHeight: '22px',
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  label: {
    fontFamily: theme.font.bold,
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

export const getDatabaseVersionNumber = (
  version: DatabaseInstance['version']
) => version.split('/')[1];

export const DatabaseSummaryClusterConfiguration = (props: Props) => {
  const { classes } = useStyles();

  const { database } = props;

  const { data: types } = useDatabaseTypesQuery();
  const { data: regions } = useRegionsQuery();

  const region = regions?.find((r) => r.id === database.region);

  const type = types?.find((type) => type.id === database?.type);

  if (!database || !type) {
    return null;
  }

  const configuration =
    database.cluster_size === 1
      ? 'Primary'
      : `Primary +${database.cluster_size - 1} replicas`;

  const sxTooltipIcon = {
    padding: '0px',
    marginLeft: '4px',
  };

  const storageCopy =
    'The total disk size is smaller than the selected plan capacity due to the OS overhead.';

  return (
    <>
      <Typography className={classes.header} variant="h3">
        Cluster Configuration
      </Typography>
      <div className={classes.configs} data-qa-cluster-config>
        <Box display="flex">
          <Typography className={classes.label}>Status</Typography>
          <span className={classes.status}>
            <StatusIcon status={databaseStatusMap[database.status]} />
            {database.status}
          </span>
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Version</Typography>
          {databaseEngineMap[database.engine]} v{database.version}
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
                text={storageCopy}
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

export default DatabaseSummaryClusterConfiguration;
