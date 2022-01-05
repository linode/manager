import {
  Database,
  DatabaseInstance,
  DatabaseStatus,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import Box from 'src/components/core/Box';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import StatusIcon from 'src/components/StatusIcon';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { useDatabaseTypesQuery } from 'src/queries/databases';

const useStyles = makeStyles((theme: Theme) => ({
  header: {
    fontWeight: 700,
    marginBottom: theme.spacing(2),
  },
  configs: {
    fontSize: '0.875rem',
    lineHeight: '22px',
  },
  label: {
    fontWeight: 700,
    lineHeight: '22px',
    width: theme.spacing(7),
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    textTransform: 'capitalize',
  },
}));

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  creating: 'other',
  running: 'active',
  failed: 'error',
  degraded: 'inactive',
  updating: 'other',
};

export const databaseEngineMap: Record<Engine, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
};

interface Props {
  database: Database;
}

export const getDatabaseVersionNumber = (
  version: DatabaseInstance['version']
) => version.split('/')[1];

export const DatabaseSummaryClusterConfiguration: React.FC<Props> = (props) => {
  const classes = useStyles();

  const { database } = props;

  const { data: types } = useDatabaseTypesQuery();

  const type = types?.find((type) => type.id === database?.type);

  if (!database || !type) {
    return null;
  }

  const configuration =
    database.failover_count === 0
      ? 'Primary'
      : `Primary +${database.failover_count} replicas`;

  return (
    <>
      <Typography className={classes.header}>Cluster Configuration</Typography>
      <div className={classes.configs}>
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
        <Box display="flex" style={{ marginBottom: 12 }}>
          <Typography className={classes.label}>Nodes</Typography>
          {configuration}
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Plan</Typography>
          {type.label}
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>RAM</Typography>
          {type.memory / 1024} GB
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>CPUs</Typography>
          {type.vcpus}
        </Box>
        <Box display="flex">
          <Typography className={classes.label}>Storage</Typography>
          {type.disk} GB
        </Box>
      </div>
    </>
  );
};

export default DatabaseSummaryClusterConfiguration;
