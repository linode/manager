import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';

interface Props {
  backup: DatabaseBackup;
}

const BackupTableRow: React.FC<Props> = ({ backup }) => {
  const { id, created } = backup;

  return (
    <TableRow key={id}>
      <TableCell>{created}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu backup={backup} />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
