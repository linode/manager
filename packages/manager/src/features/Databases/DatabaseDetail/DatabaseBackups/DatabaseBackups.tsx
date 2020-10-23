import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';
import Paper from 'src/components/core/Paper';
import TableBody from 'src/components/core/TableBody';
import TableHead from 'src/components/core/TableHead';
import TableRow from 'src/components/core/TableRow';
import Table from 'src/components/Table';
import TableCell from 'src/components/TableCell';
import BackupTableRow from './DatabaseBackupTableRow';

export const DatabaseBackups: React.FC<{}> = () => {
  // @todo replace with actual db info
  const backups: DatabaseBackup[] = [];

  return (
    <Paper style={{ padding: 0 }}>
      <Table aria-label="List of database backups">
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
