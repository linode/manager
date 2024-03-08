import {
  Database,
  DatabaseInstance,
  DatabaseStatus,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Chip } from 'src/components/Chip';
import { Hidden } from 'src/components/Hidden';
import { Status, StatusIcon } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from 'src/queries/profile';
import { useRegionsQuery } from 'src/queries/regions';
import { capitalize } from 'src/utilities/capitalize';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import { getResizeProgress } from '../utilities';
import { Event } from '@linode/api-v4';

export const databaseStatusMap: Record<DatabaseStatus, Status> = {
  active: 'active',
  degraded: 'inactive',
  failed: 'error',
  provisioning: 'other',
  restoring: 'other',
  resuming: 'other',
  suspended: 'error',
  suspending: 'other',
  resizing: 'other',
};

export const databaseEngineMap: Record<Engine, string> = {
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
};

interface Props {
  database: DatabaseInstance | Database;
  events?: Event[];
}

export const DatabaseRow = ({ database, events }: Props) => {
  const {
    cluster_size,
    created,
    engine,
    id,
    label,
    region,
    version,
  } = database;

  const { data: regions } = useRegionsQuery();
  const { data: profile } = useProfile();

  const actualRegion = regions?.find((r) => r.id === region);

  const progress = getResizeProgress(database, events);

  const status = database.status;

  const configuration =
    cluster_size === 1 ? (
      'Primary'
    ) : (
      <>
        {`Primary +${cluster_size - 1}`}
        <Chip
          label="HA"
          size="small"
          sx={(theme) => ({ borderColor: theme.color.green, mx: 2 })}
          variant="outlined"
        />
      </>
    );

  return (
    <TableRow
      ariaLabel={`Database ${label}`}
      data-qa-database-cluster-id={id}
      key={`database-row-${id}`}
    >
      <TableCell>
        <Link to={`/databases/${engine}/${id}`}>{label}</Link>
      </TableCell>
      <TableCell statusCell>
        <StatusIcon status={databaseStatusMap[status]} />
        {capitalize(database.status) +
          (progress !== undefined ? ' (' + progress + '%)' : '')}
      </TableCell>
      <Hidden smDown>
        <TableCell>{configuration}</TableCell>
      </Hidden>
      <TableCell>{`${databaseEngineMap[engine]} v${version}`}</TableCell>
      <Hidden mdDown>
        <TableCell>{actualRegion?.label ?? region}</TableCell>
      </Hidden>
      <Hidden lgDown>
        <TableCell>
          {isWithinDays(3, created)
            ? parseAPIDate(created).toRelative()
            : formatDate(created, {
                timezone: profile?.timezone,
              })}
        </TableCell>
      </Hidden>
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
