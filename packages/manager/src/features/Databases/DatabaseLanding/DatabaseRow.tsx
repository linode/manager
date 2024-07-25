import * as React from 'react';
import { Link } from 'react-router-dom';

import { Chip } from 'src/components/Chip';
import { Hidden } from 'src/components/Hidden';
import { useIsGeckoEnabled } from 'src/components/RegionSelect/RegionSelect.utils';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

import { DatabaseStatusDisplay } from '../DatabaseDetail/DatabaseStatusDisplay';

import type { Event } from '@linode/api-v4';
import type {
  Database,
  DatabaseInstance,
  Engine,
} from '@linode/api-v4/lib/databases/types';

export const databaseEngineMap: Record<Engine, string> = {
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
};

interface Props {
  database: Database | DatabaseInstance;
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

  const { isGeckoGAEnabled } = useIsGeckoEnabled();
  const { data: regions } = useRegionsQuery({
    transformRegionLabel: isGeckoGAEnabled,
  });
  const { data: profile } = useProfile();

  const actualRegion = regions?.find((r) => r.id === region);

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
    <TableRow data-qa-database-cluster-id={id} key={`database-row-${id}`}>
      <TableCell>
        <Link to={`/databases/${engine}/${id}`}>{label}</Link>
      </TableCell>
      <TableCell statusCell>
        <DatabaseStatusDisplay database={database} events={events} />
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
