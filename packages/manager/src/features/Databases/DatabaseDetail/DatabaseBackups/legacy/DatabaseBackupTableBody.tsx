import { APIError, DatabaseBackup, ResourcePage } from '@linode/api-v4';
import React from 'react';
import { TableRowEmpty } from 'src/components/TableRowEmpty/TableRowEmpty';
import { TableRowError } from 'src/components/TableRowError/TableRowError';
import { TableRowLoading } from 'src/components/TableRowLoading/TableRowLoading';
import { BackupTableRow } from './DatabaseBackupTableRow';

interface Props {
  backups?: ResourcePage<DatabaseBackup>;
  backupsError: APIError[] | null;
  databaseError: APIError[] | null;
  disabled?: boolean;
  isBackupsLoading: boolean;
  isDatabaseLoading: boolean;
  onRestore: (id: number) => void;
  order: 'asc' | 'desc';
}

const DatabaseBackupTableBody = (props: Props) => {
  const {
    backups,
    backupsError,
    databaseError,
    disabled,
    isBackupsLoading,
    isDatabaseLoading,
    onRestore,
    order,
  } = props;

  const sorter = (a: DatabaseBackup, b: DatabaseBackup) => {
    if (order === 'asc') {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    }
    return new Date(a.created).getTime() - new Date(b.created).getTime();
  };

  if (databaseError) {
    return <TableRowError colSpan={3} message={databaseError[0].reason} />;
  }

  if (backupsError) {
    return <TableRowError colSpan={3} message={backupsError[0].reason} />;
  }

  if (isDatabaseLoading || isBackupsLoading) {
    return <TableRowLoading columns={3} />;
  }

  if (backups?.results === 0) {
    return <TableRowEmpty colSpan={3} message="No backups to display." />;
  }

  if (backups) {
    return backups.data
      .sort(sorter)
      .map((backup: DatabaseBackup) => (
        <BackupTableRow
          backup={backup}
          disabled={disabled}
          key={backup.id}
          onRestore={onRestore}
        />
      ));
  }

  return null;
};

export default DatabaseBackupTableBody;
