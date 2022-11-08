import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import DatabaseBackupTableRow from './DatabaseBackupTableRow';
import TableRowError from 'src/components/TableRowError';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { useOrder } from 'src/hooks/useOrder';
import { useParams } from 'react-router-dom';
import RestoreFromBackupDialog from './RestoreFromBackupDialog';
import { DatabaseBackup, Engine } from '@linode/api-v4/lib/databases';
import {
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';

export const DatabaseBackups: React.FC = () => {
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
    isLoading: isDatabaseLoading,
    error: databaseError,
  } = useDatabaseQuery(engine, id);

  const {
    data: backups,
    isLoading: isBackupsLoading,
    error: backupsError,
  } = useDatabaseBackupsQuery(engine, id);

  const { order, orderBy, handleOrderChange } = useOrder({
    orderBy: 'created',
    order: 'desc',
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
      return <TableRowError message={databaseError[0].reason} colSpan={3} />;
    }
    if (backupsError) {
      return <TableRowError message={backupsError[0].reason} colSpan={3} />;
    }
    if (isDatabaseLoading || isBackupsLoading) {
      return <TableRowLoading columns={3} />;
    }
    if (backups?.results === 0) {
      return (
        <TableRowEmptyState message="No backups to display." colSpan={3} />
      );
    }
    if (backups) {
      return backups.data
        .sort(sorter)
        .map((backup) => (
          <DatabaseBackupTableRow
            key={backup.id}
            backup={backup}
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
              label="created"
              handleClick={handleOrderChange}
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
          open={isRestoreDialogOpen}
          database={database}
          backup={backupToRestore}
          onClose={() => setIsRestoreDialogOpen(false)}
        />
      ) : null}
    </>
  );
};

export default DatabaseBackups;
