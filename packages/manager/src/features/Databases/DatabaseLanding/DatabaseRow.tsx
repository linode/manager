import { Badge } from '@akamai/cds-components/react/Badge';
import { TableCell, TableRow } from '@akamai/cds-components/react/Table';
import { formatStorageUnits } from '@akamai/compute-ui-core/api';
import {
  formatDate,
  isWithinDays,
  parseAPIDate,
} from '@akamai/compute-ui-core/datetime';
import {
  useDatabaseTypesQuery,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { DatabaseActionMenu } from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';
import { useBreakpoint } from 'src/features/Databases/hooks/useBreakpoint';
import {
  getIsLinkInactive,
  useIsDatabasesEnabled,
} from 'src/features/Databases/utilities';

import { StyledActionMenuWrapper } from '../shared.styles';

import type { Event } from '@linode/api-v4';
import type {
  DatabaseInstance,
  DatabaseType,
} from '@linode/api-v4/lib/databases/types';
import type { ActionHandlers } from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';

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
    platform,
    region,
    status,
    type,
    updates,
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
  const { isDatabasesV2GA } = useIsDatabasesEnabled();
  const showFromSmUp = useBreakpoint('up', 'sm');
  const showFromMdUp = useBreakpoint('up', 'md');
  const showFromLgUp = useBreakpoint('up', 'lg');

  const configuration =
    cluster_size === 1 ? (
      'Primary'
    ) : (
      <>
        {`Primary +${cluster_size - 1}`}
        <Badge color="green">HA</Badge>
      </>
    );
  return (
    <TableRow
      data-qa-database-cluster-id={id}
      hoverable
      key={`database-row-${id}`}
      zebra
    >
      <TableCell
        style={{
          flex: '0 1 20.5%',
        }}
      >
        {isDatabasesV2GA && getIsLinkInactive(status) ? (
          label
        ) : (
          <Link to={`/databases/${engine}/${id}`}>{label}</Link>
        )}
      </TableCell>
      <TableCell>
        <DatabaseStatusDisplay database={database} events={events} />
      </TableCell>
      {isNewDatabase && <TableCell>{formattedPlan}</TableCell>}
      {showFromSmUp && <TableCell>{configuration}</TableCell>}
      <TableCell>
        <DatabaseEngineVersion
          databaseEngine={engine}
          databaseID={id}
          databasePendingUpdates={updates.pending}
          databasePlatform={platform}
          databaseVersion={version}
        />
      </TableCell>
      {showFromMdUp && <TableCell>{actualRegion?.label ?? region}</TableCell>}
      {showFromLgUp && (
        <TableCell>
          {isWithinDays(3, created)
            ? parseAPIDate(created).toRelative()
            : formatDate(created, {
                timezone: profile?.timezone,
              })}
        </TableCell>
      )}
      {isDatabasesV2GA && isNewDatabase && (
        <StyledActionMenuWrapper>
          <DatabaseActionMenu
            databaseEngine={engine}
            databaseId={id}
            databaseLabel={label}
            databaseStatus={status}
            handlers={handlers!}
          />
        </StyledActionMenuWrapper>
      )}
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
