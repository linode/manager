import {
  DatabaseInstance,
  DatabaseStatus,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Chip from 'src/components/core/Chip';
import Hidden from 'src/components/core/Hidden';
import StatusIcon from 'src/components/StatusIcon';
import { Status } from 'src/components/StatusIcon/StatusIcon';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { dcDisplayNames } from 'src/constants';
import { capitalize } from 'src/utilities/capitalize';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

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

interface Props {
  database: DatabaseInstance;
}

export const DatabaseRow: React.FC<Props> = ({ database }) => {
  const {
    id,
    label,
    engine,
    created,
    status,
    region,
    version,
    cluster_size,
  } = database;

  const configuration =
    cluster_size === 1 ? (
      'Primary'
    ) : (
      <>
        {`Primary +${cluster_size - 1}`}
        <Chip
          variant="outlined"
          outlineColor="green"
          label="HA"
          size="small"
          inTable
        />
      </>
    );

  return (
    <TableRow
      key={`database-row-${id}`}
      ariaLabel={`Database ${label}`}
      data-qa-database-cluster-id={id}
    >
      <TableCell>
        <Link to={`/databases/${engine}/${id}`}>{label}</Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={databaseStatusMap[status]} />
        {capitalize(status)}
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
