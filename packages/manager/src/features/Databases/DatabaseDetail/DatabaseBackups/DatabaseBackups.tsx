import { DatabaseBackup, Engine } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import { useParams } from 'react-router-dom';

import { Table } from 'src/components/Table';
import { TableBody } from 'src/components/TableBody';
import { TableCell } from 'src/components/TableCell';
import { TableHead } from 'src/components/TableHead';
import { TableRow } from 'src/components/TableRow';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { TableSortCell } from 'src/components/TableSortCell';
import { Typography } from 'src/components/Typography';
import { Paper } from 'src/components/Paper';
import { useOrder } from 'src/hooks/useOrder';
import {
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases';

import RestoreFromBackupDialog from './RestoreFromBackupDialog';
import { BackupTableRow } from './DatabaseBackupTableRow';

export const DatabaseBackups = () => {
  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [idOfBackupToRestore, setIdOfBackupToRestore] = React.useState<
    number | undefined
  >();

  const id = Number(databaseId);

  const {
    data: database,
    error: databaseError,
    isLoading: isDatabaseLoading,
  } = useDatabaseQuery(engine, id);

  const {
    data: backups,
    error: backupsError,
    isLoading: isBackupsLoading,
  } = useDatabaseBackupsQuery(engine, id);

  const { handleOrderChange, order, orderBy } = useOrder({
    order: 'desc',
    orderBy: 'created',
  });

  const onRestore = (id: number) => {
    setIdOfBackupToRestore(id);
    setIsRestoreDialogOpen(true);
  };

  const backupToRestore = backups?.data.find(
    (backup) => backup.id === idOfBackupToRestore
  );

  const sorter = (a: DatabaseBackup, b: DatabaseBackup) => {
    if (order === 'asc') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  };

  const renderTableBody = () => {
    if (databaseError) {
      return <TableRowError colSpan={3} message={databaseError[0].reason} />;
    }
    if (backupsError) {
      return <TableRowError colSpan={3} message={backupsError[0].reason} />;
    }
    if (isDatabaseLoading || isBackupsLoading) {
      return <TableRowLoading columns={3} />;
    }
    if (backups?.results === 0) {
      return <TableRowEmpty colSpan={3} message="No backups to display." />;
    }
    if (backups) {
      return backups.data
        .sort(sorter)
        .map((backup) => (
          <BackupTableRow
            backup={backup}
            key={backup.id}
            onRestore={onRestore}
          />
        ));
    }
    return null;
  };

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
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
          A backup of this database is created every 24 hours and each backup is
          retained for 7 days.
        </Typography>
      </Paper>
      {database && backupToRestore ? (
        <RestoreFromBackupDialog
          backup={backupToRestore}
          database={database}
          onClose={() => setIsRestoreDialogOpen(false)}
          open={isRestoreDialogOpen}
        />
      ) : null}
    </>
  );
};

export default DatabaseBackups;
