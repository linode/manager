import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import BackupTableRow from './DatabaseBackupTableRow';

interface Props {
  backups: DatabaseBackup[];
}

type CombinedProps = Props;

export const DatabaseBackups: React.FC<CombinedProps> = props => {
  const { backups } = props;

  return (
    <Paper style={{ padding: 0 }}>
      <Table aria-label="List of Backups">
        <TableHead>
          <TableRow>
            <TableCell>Backup ID</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date Created</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {backups.map((backup: DatabaseBackup, idx: number) => (
            <BackupTableRow key={idx} backup={backup} />
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default DatabaseBackups;
