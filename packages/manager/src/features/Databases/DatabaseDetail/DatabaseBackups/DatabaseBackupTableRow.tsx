import { DatabaseBackup } from '@linode/api-v4/lib/databases';
import { Duration } from 'luxon';
import * as React from 'react';
import TableRow from 'src/components/core/TableRow';
import TableCell from 'src/components/TableCell/TableCell_CMR';
// import LinodeBackupActionMenu from './LinodeBackupActionMenu';
import { formatDuration } from 'src/utilities/formatDuration';
import { parseAPIDate } from 'src/utilities/date';

interface Props {
  backup: DatabaseBackup;
  // disabled: boolean;
  // handleRestore: (backup: DatabaseBackup) => void;
  // handleDeploy: (backup: DatabaseBackup) => void;
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
        {/* <LinodeBackupActionMenu
          backup={backup}
          disabled={disabled}
          onRestore={handleRestore}
          onDeploy={onDeploy}
        /> */}
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
