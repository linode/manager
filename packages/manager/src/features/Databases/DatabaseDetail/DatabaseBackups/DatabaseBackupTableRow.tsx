import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { Duration } from 'luxon';
import * as React from 'react';
import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell/TableCell_CMR';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';
import { formatDuration } from 'src/utilities/formatDuration';
import { parseAPIDate } from 'src/utilities/date';

interface Props {
  backup: DatabaseBackup;
  // TBD As of 10/23/20, Restore and Delete are the only documented actions that can be taken for db backups.
  // @todo add in when API work is finalized
  // handleRestore: (backup: DatabaseBackup) => void;
  // handleDelete: (backup: DatabaseBackup) => void;
}

const BackupTableRow: React.FC<Props> = props => {
  const { backup } = props;
  return (
    <TableRow key={backup.id} data-qa-backup>
      <TableCell data-qa-backup-name={backup.id}>{backup.id}</TableCell>
      <TableCell>{backup.status}</TableCell>
      <TableCell>{backup.created}</TableCell>
      <TableCell>
        {formatDuration(
          Duration.fromMillis(
            parseAPIDate(backup.finished).toMillis() -
              parseAPIDate(backup.created).toMillis()
          )
        )}
      </TableCell>
      <TableCell>
        <DatabaseBackupActionMenu backup={backup} />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
