import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { Duration } from 'luxon';
import * as React from 'react';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import TableRow from 'src/components/TableRow';
import { parseAPIDate } from 'src/utilities/date';
import { formatDuration } from 'src/utilities/formatDuration';
import DatabaseBackupActionMenu from './DatabaseBackupActionMenu';

interface Props {
  backup: DatabaseBackup;
  // TBD As of 10/23/20, Restore and Delete are the only documented actions that can be taken for db backups.
  // @todo add in when API work is finalized
  // handleRestore: (backup: DatabaseBackup) => void;
  // handleDelete: (backup: DatabaseBackup) => void;
}

const BackupTableRow: React.FC<Props> = (props) => {
  const { backup } = props;
  return (
    <TableRow key={backup.id} data-qa-backup>
      <TableCell data-qa-backup-name={backup.id}>{backup.id}</TableCell>
      {/* <TableCell>{backup.status}</TableCell> */}
      <TableCell>
        <DateTimeDisplay value={backup.created} />
      </TableCell>
      <TableCell>
        {backup.finished &&
          formatDuration(
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
