import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';
import formatDate from 'src/utilities/formatDate';
import formatBackupLabel from 'src/utilities/formatBackupLabel';
import { parseAPIDate } from 'src/utilities/date';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}

const BackupTableRow: React.FC<Props> = ({ backup, onRestore, onDelete }) => {
  const { id, created } = backup;

  return (
    <TableRow key={id}>
      <TableCell>{formatBackupLabel(backup)}</TableCell>
      <TableCell>{formatDate(created)}</TableCell>
      <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu
          backup={backup}
          onRestore={onRestore}
          onDelete={onDelete}
        />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
