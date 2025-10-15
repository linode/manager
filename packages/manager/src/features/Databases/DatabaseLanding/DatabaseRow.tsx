import {
  useDatabaseTypesQuery,
  useProfile,
  useRegionsQuery,
} from '@linode/queries';
import { Chip, Hidden, styled } from '@linode/ui';
import { formatStorageUnits } from '@linode/utilities';
import { TableCell, TableRow } from 'akamai-cds-react-components/Table';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { DatabaseStatusDisplay } from 'src/features/Databases/DatabaseDetail/DatabaseStatusDisplay';
import { DatabaseEngineVersion } from 'src/features/Databases/DatabaseEngineVersion';
import { DatabaseActionMenu } from 'src/features/Databases/DatabaseLanding/DatabaseActionMenu';
import { useIsDatabasesEnabled } from 'src/features/Databases/utilities';
import { isWithinDays, parseAPIDate } from 'src/utilities/date';
import { formatDate } from 'src/utilities/formatDate';

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

const DatabaseActionMenuStyledWrapper = styled(TableCell, {
  label: 'DatabaseActionMenuStyledWrapper',
})(({ theme }) => ({
  justifyContent: 'flex-end',
  display: 'flex',
  alignItems: 'center',
  maxWidth: 40,
  '& button': {
    padding: 0,
    color: theme.tokens.alias.Content.Icon.Primary.Default,
    backgroundColor: 'transparent',
  },
  '& button:hover': {
    backgroundColor: 'transparent',
    color: theme.tokens.alias.Content.Icon.Primary.Hover,
  },
}));

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
  const isLinkInactive =
    status === 'suspended' ||
    status === 'suspending' ||
    status === 'resuming' ||
    status === 'migrated';
  const { isDatabasesV2GA } = useIsDatabasesEnabled();

  const configuration =
    cluster_size === 1 ? (
      'Primary'
    ) : (
      <>
        {`Primary +${cluster_size - 1}`}
        <Chip
          label="HA"
          size="small"
          sx={(theme) => ({ borderColor: theme.color.green, mx: 0, my: 0 })}
          variant="outlined"
        />
      </>
    );
  return (
    <TableRow
      data-qa-database-cluster-id={id}
      hoverable
      key={`database-row-${id}`}
      zebra
    >
      <div style={{ width: 230 }}>
        <TableCell>
          {isDatabasesV2GA && isLinkInactive ? (
            label
          ) : (
            <Link to={`/databases/${engine}/${id}`}>{label}</Link>
          )}
        </TableCell>
      </div>
      <TableCell>
        <DatabaseStatusDisplay database={database} events={events} />
      </TableCell>
      {isNewDatabase && <TableCell>{formattedPlan}</TableCell>}
      <Hidden smDown>
        <TableCell>{configuration}</TableCell>
      </Hidden>
      <TableCell>
        <DatabaseEngineVersion
          databaseEngine={engine}
          databaseID={id}
          databasePendingUpdates={updates.pending}
          databasePlatform={platform}
          databaseVersion={version}
        />
      </TableCell>
      <Hidden mdDown>
        <div style={{ width: 125 }}>
          <TableCell>{actualRegion?.label ?? region}</TableCell>
        </div>
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
      {isDatabasesV2GA && isNewDatabase && (
        <DatabaseActionMenuStyledWrapper>
          <DatabaseActionMenu
            databaseEngine={engine}
            databaseId={id}
            databaseLabel={label}
            databaseStatus={status}
            handlers={handlers!}
          />
        </DatabaseActionMenuStyledWrapper>
      )}
    </TableRow>
  );
};

export default React.memo(DatabaseRow);
