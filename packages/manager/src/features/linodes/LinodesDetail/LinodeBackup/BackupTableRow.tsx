import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { DateTime, Duration } from 'luxon';
import * as React from 'react';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import LinodeBackupActionMenu from './LinodeBackupActionMenu';

interface Props {
  backup: LinodeBackup;
  disabled: boolean;
  handleRestore: (backup: LinodeBackup) => void;
  handleDeploy: (backup: LinodeBackup) => void;
}

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual'
};

const humanizeDuration = (duration: Duration) => {
  const hours = duration.as('hours');
  if (hours >= 1) {
    const dur = duration.shiftTo('hours', 'minutes');
    return `${dur.hours} hour${dur.hours > 1 ? 's' : ''} ${
      dur.minutes
    } minute${dur.minutes ?? 's'}`;
  }
  const minutes = duration.as('minutes');
  if (minutes >= 1) {
    const dur = duration.shiftTo('minutes', 'seconds');
    return `${dur.minutes} minute${dur.minutes > 1 ? 's' : ''} ${
      dur.seconds
    } second${dur.seconds ? 's' : ''}`;
  }
  const seconds = duration.as('seconds');
  return `${seconds} hour${seconds >= 2 ?? 's'}`;
};

const BackupTableRow: React.FC<Props> = props => {
  const onDeploy = () => {
    props.handleDeploy(props.backup);
  };
  const { backup, disabled, handleRestore } = props;
  return (
    <TableRow key={backup.id} data-qa-backup>
      <TableCell
        parentColumn="Label"
        data-qa-backup-name={backup.label || typeMap[backup.type]}
      >
        {backup.label || typeMap[backup.type]}
      </TableCell>
      <TableCell parentColumn="Date Created">
        {/** important to note that we're intentionally not humanizing the time here */}
        <DateTimeDisplay value={backup.created} />
      </TableCell>
      <TableCell parentColumn="Duration">
        {humanizeDuration(
          Duration.fromMillis(
            DateTime.fromISO(backup.finished).toMillis() -
              DateTime.fromISO(backup.created).toMillis()
          )
        )}
      </TableCell>
      <TableCell parentColumn="Disks" data-qa-backup-disks>
        {backup.disks.map((disk, idx) => (
          <div key={idx}>
            {disk.label} ({disk.filesystem}) - {disk.size}MB
          </div>
        ))}
      </TableCell>
      <TableCell parentColumn="Space Required" data-qa-space-required>
        {backup.disks.reduce((acc, disk) => acc + disk.size, 0)}MB
      </TableCell>
      <TableCell>
        <LinodeBackupActionMenu
          backup={backup}
          disabled={disabled}
          onRestore={handleRestore}
          onDeploy={onDeploy}
        />
      </TableCell>
    </TableRow>
  );
};

export default BackupTableRow;
