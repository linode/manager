import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import Typography from 'src/components/core/Typography';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import TableSortCell from 'src/components/TableSortCell';
import { useOrder } from 'src/hooks/useOrder';
import DatabaseBackupTableRow from './DatabaseBackupTableRow';
import TableRowLoading from 'src/components/TableRowLoading';
import TableRowError from 'src/components/TableRowError';
import TableRowEmptyState from 'src/components/TableRowEmptyState';

export const DatabaseBackups: React.FC = () => {
  const error = undefined;
  const isLoading = false;

  const { order, orderBy, handleOrderChange } = useOrder({
    orderBy: 'created',
    order: 'desc',
  });

  const data = [
    {
      id: 1,
      type: 'auto',
      label: 'backup',
      description: 'backup of database before launch',
      created: new Date(1639592380049).toLocaleString(),
    },
    {
      id: 2,
      type: 'auto',
      label: 'backup',
      description: 'backup of database after launch',
      created: new Date().toLocaleString(),
    },
  ];

  const renderTableBody = () => {
    if (isLoading) {
      return <TableRowLoading oneLine numberOfColumns={2} colSpan={2} />;
    } else if (error) {
      return <TableRowError message={error[0].reason} colSpan={2} />;
    } else if (data?.results == 0) {
      return (
        <TableRowEmptyState message="No backups to display." colSpan={2} />
      );
    } else if (data) {
      return data.map((backup) => (
        <DatabaseBackupTableRow key={backup.id} backup={backup} />
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
    </>
  );
};

export default DatabaseBackups;
