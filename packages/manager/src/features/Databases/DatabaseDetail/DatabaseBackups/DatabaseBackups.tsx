import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { DatabaseBackupTableRow } from './DatabaseBackupTableRow';
import TableRowError from 'src/components/TableRowError';
import TableRowEmptyState from 'src/components/TableRowEmptyState';
import { useOrder } from 'src/hooks/useOrder';
import { useParams } from 'react-router-dom';
import { RestoreFromBackupDialog } from './RestoreFromBackupDialog';
import { CreateBackupDialog } from './CreateBackupDialog';
import { DeleteBackupDialog } from './DeleteBackupDialog';
import { Engine } from '@linode/api-v4/lib/databases';
import {
  useDatabaseBackupsQuery,
  useDatabaseQuery,
} from 'src/queries/databases';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import Button from 'src/components/Button';
import Hidden from 'src/components/core/Hidden';

export const DatabaseBackups = () => {
  const { databaseId, engine } = useParams<{
    databaseId: string;
    engine: Engine;
  }>();

  const [isBackupDialogOpen, setIsBackupDialogOpen] = React.useState(false);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [idOfSelectedBackup, setIdOfSelectedBackup] = React.useState<
    number | undefined
  >();

  const id = Number(databaseId);

  const {
    data: database,
    isLoading: isDatabaseLoading,
    error: databaseError,
  } = useDatabaseQuery(engine, id);

  const { order, orderBy, handleOrderChange } = useOrder({
    orderBy: 'created',
    order: 'desc',
  });

  const {
    data: backups,
    isLoading: isBackupsLoading,
    error: backupsError,
  } = useDatabaseBackupsQuery(
    engine,
    id,
    {},
    { '+order': order, '+order_by': orderBy },
    // Enable the query if the database is done provisioning
    database?.status !== 'provisioning'
  );

  const onBackup = () => {
    setIsBackupDialogOpen(true);
  };

  const onRestore = (id: number) => {
    setIdOfSelectedBackup(id);
    setIsRestoreDialogOpen(true);
  };

  const onDelete = (id: number) => {
    setIdOfSelectedBackup(id);
    setIsDeleteDialogOpen(true);
  };

  const selectedBackup = backups?.data.find(
    (backup) => backup.id === idOfSelectedBackup
  );

  const renderTableBody = () => {
    if (databaseError) {
      return <TableRowError message={databaseError[0].reason} colSpan={4} />;
    }
    if (backupsError) {
      return <TableRowError message={backupsError[0].reason} colSpan={4} />;
    }
    if (isDatabaseLoading || isBackupsLoading) {
      return (
        <TableRowLoading
          responsive={{ 2: { mdDown: true } }}
          columns={4}
          rows={backups?.results ?? 7}
        />
      );
    }
    if (backups?.results === 0 || database?.status === 'provisioning') {
      return (
        <TableRowEmptyState message="No backups to display." colSpan={4} />
      );
    }
    if (backups) {
      return backups.data.map((backup) => (
        <DatabaseBackupTableRow
          key={backup.id}
          backup={backup}
          onRestore={onRestore}
          onDelete={onDelete}
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
              active={orderBy === 'type'}
              direction={order}
              label="type"
              handleClick={handleOrderChange}
              style={{ width: 155 }}
            >
              Backup Type
            </TableSortCell>
            <TableSortCell
              active={orderBy === 'created'}
              direction={order}
              label="created"
              handleClick={handleOrderChange}
              style={{ width: 155 }}
            >
              Date Created
            </TableSortCell>
            <Hidden mdDown>
              <TableCell></TableCell>
            </Hidden>
            <TableCell style={{ width: 100 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{renderTableBody()}</TableBody>
      </Table>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Manual Backup</Typography>
        <div
          style={{
            clear: 'both',
            display: 'flex',
            verticalAlign: 'top',
            justifyContent: 'space-between',
          }}
        >
          <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
            Trigger a manual backup outside of the usual schedule.<br></br>
          </Typography>
          <Button buttonType="primary" onClick={() => onBackup()}>
            Start Backup
          </Button>
        </div>
      </Paper>
      <Paper style={{ marginTop: 16 }}>
        <Typography variant="h3">Backup Schedule</Typography>
        <Typography style={{ lineHeight: '20px', marginTop: 4 }}>
          A backup of this database is created every 24 hours and each backup is
          retained for 7 days.
        </Typography>
      </Paper>
      {database && selectedBackup ? (
        <DeleteBackupDialog
          open={isDeleteDialogOpen}
          database={database}
          backup={selectedBackup}
          onClose={() => setIsDeleteDialogOpen(false)}
        />
      ) : null}
      {database && selectedBackup ? (
        <RestoreFromBackupDialog
          open={isRestoreDialogOpen}
          database={database}
          backup={selectedBackup}
          onClose={() => setIsRestoreDialogOpen(false)}
        />
      ) : null}
      {database ? (
        <CreateBackupDialog
          open={isBackupDialogOpen}
          database={database}
          onClose={() => setIsBackupDialogOpen(false)}
        />
      ) : null}
    </>
  );
};

export default DatabaseBackups;
