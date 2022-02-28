import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';
import formatDate from 'src/utilities/formatDate';
import { parseAPIDate } from 'src/utilities/date';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
}

const BackupTableRow: React.FC<Props> = ({ backup, onRestore }) => {
  const { id, created } = backup;

  return (
    <TableRow key={id}>
      <TableCell>{formatDate(created)}</TableCell>
      <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu backup={backup} onRestore={onRestore} />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
