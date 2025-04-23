import { Paper, Typography } from '@linode/ui';
import * as React from 'react';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableSortCell } from 'src/components/TableSortCell';
import RestoreLegacyFromBackupDialog from 'src/features/Databases/DatabaseDetail/DatabaseBackups/legacy/RestoreLegacyFromBackupDialog';
import { useOrder } from 'src/hooks/useOrder';
import { useDatabaseBackupsQuery } from 'src/queries/databases/databases';

import DatabaseBackupTableBody from './DatabaseBackupTableBody';

import type { APIError } from '@linode/api-v4';
import type { Database, Engine } from '@linode/api-v4/lib/databases';

interface Props {
  database: Database | undefined;
  databaseError: APIError[] | null;
  disabled?: boolean;
  engine: Engine;
  isDatabaseLoading: boolean;
}

export const DatabaseBackupsLegacy = (props: Props) => {
  const {
    database,
    databaseError,
    disabled,
    engine,
    isDatabaseLoading,
  } = props;

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [idOfBackupToRestore, setIdOfBackupToRestore] = React.useState<
    number | undefined
  >();

  const id = database ? Number(database.id) : 0;

  const {
    data: backups,
    error: backupsError,
    isLoading: isBackupsLoading,
  } = useDatabaseBackupsQuery(engine, id, Boolean(database));

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'created',
  });

  if (!database) {
    return null;
  }

  const onRestoreLegacyDatabase = (id: number) => {
    setIdOfBackupToRestore(id);
    setIsRestoreDialogOpen(true);
  };

  const backupToRestoreLegacy = backups?.data.find(
    (backup) => backup.id === idOfBackupToRestore
  );

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              handleClick={handleOrderChange}
              label="created"
              style={{ width: 155 }}
            >
              Date Created
            </TableSortCell>
            <TableCell></TableCell>
            <TableCell style={{ width: 100 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <DatabaseBackupTableBody
            backups={backups}
            backupsError={backupsError}
            databaseError={databaseError}
            disabled={disabled}
            isBackupsLoading={isBackupsLoading}
            isDatabaseLoading={isDatabaseLoading}
            onRestore={onRestoreLegacyDatabase}
            order={order}
          />
        </TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
          A backup of this database is created every 24 hours and each backup is
          retained for 7 days.
        </Typography>
      </Paper>
      {database && backupToRestoreLegacy && (
        <RestoreLegacyFromBackupDialog
          backup={backupToRestoreLegacy}
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
        />
      )}
    </>
  );
};

export default DatabaseBackupsLegacy;
