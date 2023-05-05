import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';
import formatDate from 'src/utilities/formatDate';
import { parseAPIDate } from 'src/utilities/date';
import { useProfile } from 'src/queries/profile';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
}

const BackupTableRow: React.FC<Props> = ({ backup, onRestore }) => {
  const { id, created } = backup;

  const { data: profile } = useProfile();

  return (
    <TableRow key={id}>
      <TableCell>
        {formatDate(created, {
          timezone: profile?.timezone,
        })}
      </TableCell>
      <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu backup={backup} onRestore={onRestore} />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
