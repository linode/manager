import * as React from 'react';
import classNames from 'classnames';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import StatusIcon from 'src/components/StatusIcon';
import Hidden from 'src/components/core/Hidden';
import Chip from 'src/components/core/Chip';
import { Link } from 'react-router-dom';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import { makeStyles } from 'src/components/core/styles';
import { dcDisplayNames } from 'src/constants';
import { formatDate } from 'src/utilities/formatDate';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { useStyles as useChipStyles } from 'src/features/Volumes/VolumeTableRow';
import {
  DatabaseInstance,
  DatabaseStatus,
  Engine,
} from '@linode/api-v4/lib/databases/types';

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  provisioning: 'other',
  active: 'active',
  suspending: 'other',
  suspended: 'error',
  resuming: 'other',
  restoring: 'other',
  failed: 'error',
  degraded: 'inactive',
};

export const databaseEngineMap: Record<Engine, string> = {
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  mongodb: 'MongoDB',
  redis: 'Redis',
};

const useStyles = makeStyles(() => ({
  capitalize: {
    textTransform: 'capitalize',
  },
  status: {
    display: 'flex',
    alignItems: 'center',
  },
}));

interface Props {
  database: DatabaseInstance;
}

export const DatabaseRow: React.FC<Props> = ({ database }) => {
  const classes = useStyles();
  const chipClasses = useChipStyles();
  const {
    id,
    label,
    engine,
    created,
    status,
    region,
    version,
    failover_count,
  } = database;

  const configuration =
    failover_count === 0 ? (
      'Primary'
    ) : (
      <>
        {`Primary +${failover_count}`}
        <Chip
          className={`${chipClasses.chip} ${chipClasses.nvmeChip}`}
          label="HA"
        />
      </>
    );

  return (
    <TableRow key={`database-row-${id}`} ariaLabel={`Database ${label}`}>
      <TableCell>
        <Link to={`/databases/${engine}/${id}`}>{label}</Link>
      </TableCell>
      <TableCell>
        <div className={classNames(classes.status, classes.capitalize)}>
          <StatusIcon status={databaseStatusMap[status]} />
          {status}
        </div>
      </TableCell>
      <Hidden xsDown>
        <TableCell>{configuration}</TableCell>
      </Hidden>
      <TableCell>{`${databaseEngineMap[engine]} v${version}`}</TableCell>
      <Hidden smDown>
        <TableCell>{dcDisplayNames[region] || 'Unknown Region'}</TableCell>
      </Hidden>
      <Hidden mdDown>
        <TableCell>
          {isWithinDays(3, created)
            ? parseAPIDate(created).toRelative()
            : formatDate(created)}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
