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
import TableRowLoading from 'src/components/TableRowLoading';
import TableRowError from 'src/components/TableRowError';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { useOrder } from 'src/hooks/useOrder';
import { useParams } from 'react-router-dom';
import { RestoreFromBackupDialog } from './RestoreFromBackupDialog';
import {
  getDatabaseEngine,
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';

export const DatabaseBackups: React.FC = () => {
  const { databaseId } = useParams<{ databaseId: string }>();

  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [idOfBackupToRestore, setIdOfBackupToRestore] = React.useState<
    number | undefined
  >();

  const id = Number(databaseId);

  const {
    data: database,
    isLoading: isDatabaseLoading,
    error: databaseError,
  } = useDatabaseQuery(getDatabaseEngine(id), id);

  const {
    data: backups,
    isLoading: isBackupsLoading,
    error: backupsError,
  } = useDatabaseBackupsQuery(getDatabaseEngine(id), id);

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
      return <TableRowError message={databaseError[0].reason} colSpan={2} />;
    } else if (backupsError) {
      return <TableRowError message={backupsError[0].reason} colSpan={2} />;
    } else if (isDatabaseLoading || isBackupsLoading) {
      return <TableRowLoading oneLine numberOfColumns={2} colSpan={2} />;
    } else if (backups?.results === 0) {
      return (
        <TableRowEmptyState message="No backups to display." colSpan={2} />
      );
    } else if (backups) {
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
            >
              Date Created
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography>
          A backup of this database is created every 24 hours at 0:00 UTC on a 7
          day cycle.
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
