import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { DateTime, Duration } from 'luxon';
import * as React from 'react';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { StatusIcon, Status } from 'src/components/StatusIcon/StatusIcon';
import { TableCell } from 'src/components/TableCell';
import { TableRow } from 'src/components/TableRow';
import { parseAPIDate } from 'src/utilities/date';
import { formatDuration } from 'src/utilities/formatDuration';
import { LinodeBackupActionMenu } from './LinodeBackupActionMenu';

interface Props {
  backup: LinodeBackup;
  disabled: boolean;
  handleRestore: () => void;
  handleDeploy: () => void;
}

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

const statusTextMap: Record<LinodeBackup['status'], string> = {
  failed: 'Failed',
  needsPostProcessing: 'Processing',
  paused: 'Paused',
  pending: 'Pending',
  running: 'Running',
  successful: 'Success',
  userAborted: 'Aborted',
};

const statusIconMap: Record<LinodeBackup['status'], Status> = {
  failed: 'error',
  needsPostProcessing: 'other',
  paused: 'inactive',
  pending: 'other',
  running: 'other',
  successful: 'active',
  userAborted: 'error',
};

const BackupTableRow = (props: Props) => {
  const { backup, disabled, handleDeploy, handleRestore } = props;

  return (
    <TableRow key={backup.id} data-qa-backup>
      <TableCell
        parentColumn="Label"
        data-qa-backup-name={backup.label || typeMap[backup.type]}
      >
        {backup.label || typeMap[backup.type]}
      </TableCell>
      <TableCell
        statusCell
        parentColumn="Status"
        data-qa-backup-name={backup.status}
      >
        <StatusIcon status={statusIconMap[backup.status] ?? 'other'} />
        {statusTextMap[backup.status]}
      </TableCell>
      <TableCell parentColumn="Date Created">
        {/** important to note that we're intentionally not humanizing the time here */}
        <DateTimeDisplay value={backup.created} />
      </TableCell>
      <TableCell parentColumn="Duration">
        {formatDuration(
          Duration.fromMillis(
            (backup.finished
              ? parseAPIDate(backup.finished).toMillis()
              : DateTime.now().toMillis()) -
              parseAPIDate(backup.created).toMillis()
          )
        )}
      </TableCell>
      <TableCell parentColumn="Disks" data-qa-backup-disks>
        {backup.disks.map((disk, idx) => (
          <div key={idx}>
            {disk.label} ({disk.filesystem}) - {disk.size} MB
          </div>
        ))}
      </TableCell>
      <TableCell parentColumn="Space Required" data-qa-space-required>
        {backup.disks.reduce((acc, disk) => acc + disk.size, 0)} MB
      </TableCell>
      <TableCell actionCell>
        <LinodeBackupActionMenu
          backup={backup}
          disabled={disabled}
          onRestore={handleRestore}
          onDeploy={handleDeploy}
        />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
