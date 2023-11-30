import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { parseAPIDate } from 'src/utilities/date';

import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
}

export const BackupTableRow = ({ backup, onRestore }: Props) => {
  const { created, id } = backup;

  return (
    <TableRow key={id}>
      <TableCell>
        <DateTimeDisplay value={created} />
      </TableCell>
      <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu backup={backup} onRestore={onRestore} />
      </TableCell>
    </TableRow>
  );
};
