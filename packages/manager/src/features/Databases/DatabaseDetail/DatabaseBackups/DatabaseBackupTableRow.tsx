import * as React from 'react';
import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { DatabaseBackupActionMenu } from './DatabaseBackupActionMenu';
import formatDate from 'src/utilities/formatDate';
import { backupTypeMap } from 'src/features/Databases/databaseUtils';
import { parseAPIDate } from 'src/utilities/date';
import Hidden from 'src/components/core/Hidden';

interface Props {
  backup: DatabaseBackup;
  onRestore: (id: number) => void;
  onDelete: (id: number) => void;
}

export const DatabaseBackupTableRow = ({
  backup,
  onRestore,
  onDelete,
}: Props) => {
  const { id, created, type } = backup;

  return (
    <TableRow key={id}>
      <TableCell>{backupTypeMap[type] ?? 'Backup'}</TableCell>
      <TableCell>{formatDate(created)}</TableCell>
      <Hidden mdDown>
        <TableCell>{parseAPIDate(created).toRelative()}</TableCell>
      </Hidden>
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
