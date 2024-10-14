import * as React from 'react';
import { Link } from 'react-router-dom';

import { Chip } from 'src/components/Chip';
import { Hidden } from 'src/components/Hidden';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import { DatabaseActionMenu } from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { useDatabaseTypesQuery } from 'src/queries/databases/databases';
import { useProfile } from 'src/queries/profile/profile';
import { useRegionsQuery } from 'src/queries/regions/regions';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';
import { formatStorageUnits } from 'src/utilities/formatStorageUnits';

import type { Event } from '@linode/api-v4';
import type {
  DatabaseInstance,
  DatabaseType,
  Engine,
} from '@linode/api-v4/lib/databases/types';
import type { ActionHandlers } from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';

export const databaseEngineMap: Record<Engine, string> = {
  mongodb: 'MongoDB',
  mysql: 'MySQL',
  postgresql: 'PostgreSQL',
  redis: 'Redis',
};

interface Props {
  database: DatabaseInstance;
  events?: Event[];
  /**
   * Not used for V1, will be required once migration is complete
   * @since DBaaS V2 GA
   */
  handlers?: ActionHandlers;
  isNewDatabase?: boolean;
}

export const DatabaseRow = ({
  database,
  events,
  handlers,
  isNewDatabase,
}: Props) => {
  const {
    cluster_size,
    created,
    engine,
    id,
    label,
    region,
    type,
    version,
  } = database;

  const { data: regions } = useRegionsQuery();
  const { data: profile } = useProfile();
  const { data: types } = useDatabaseTypesQuery({
    platform: database.platform,
  });
  const plan = types?.find((t: DatabaseType) => t.id === type);
  const formattedPlan = plan && formatStorageUnits(plan.label);
  const actualRegion = regions?.find((r) => r.id === region);
  const { isV2GAUser } = useIsDatabasesEnabled();

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
      {isNewDatabase && <TableCell>{formattedPlan}</TableCell>}
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
      {isV2GAUser && isNewDatabase && (
        <TableCell actionCell>
          <DatabaseActionMenu
            databaseEngine={engine}
            databaseId={id}
            databaseLabel={label}
            handlers={handlers!}
          />
        </TableCell>
      )}
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
