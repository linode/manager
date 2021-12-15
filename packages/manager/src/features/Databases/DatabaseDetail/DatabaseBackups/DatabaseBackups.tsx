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

export const DatabaseBackups: React.FC = () => {
  const { order, orderBy, handleOrderChange } = useOrder({
    orderBy: 'status',
    order: 'desc',
  });

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
              style={{ width: 'auto' }}
            >
              Date Created
            </TableSortCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((backup) => (
            // @ts-expect-error type to come
            <DatabaseBackupTableRow key={backup.id} backup={backup} />
          ))}
        </TableBody>
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
