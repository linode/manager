import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';

import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { useProfile } from 'src/queries/profile';
import { parseAPIDate } from 'src/utilities/date';
import formatDate from 'src/utilities/formatDate';

import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
}

const BackupTableRow: React.FC<Props> = ({ backup, onRestore }) => {
  const { created, id } = backup;

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
