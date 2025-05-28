import * as React from 'react';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { parseAPIDate } from 'src/utilities/date';

import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';

import type { DatabaseBackup } from '@linode/api-v4/lib/databases';

interface Props {
  backup: DatabaseBackup;
  disabled?: boolean;
  onRestore: (id: number) => void;
}

export const BackupTableRow = ({ backup, disabled, onRestore }: Props) => {
  const { created, id } = backup;

  return (
    <TableRow key={id}>
      <TableCell>
        <DateTimeDisplay value={created} />
      </TableCell>
      <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      <TableCell>
        <DatabaseBackupActionMenu
          backup={backup}
          disabled={disabled}
          onRestore={onRestore}
        />
      </TableCell>
    </TableRow>
  );
};
