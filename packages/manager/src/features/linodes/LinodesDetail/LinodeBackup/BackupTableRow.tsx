import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { Duration } from 'luxon';
import * as React from 'react';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import LinodeBackupActionMenu from './LinodeBackupActionMenu';
import { formatDuration } from 'src/utilities/formatDuration';
import { parseAPIDate } from 'src/utilities/date';
interface Props {
  backup: LinodeBackup;
  disabled: boolean;
  handleRestore: (backup: LinodeBackup) => void;
  handleDeploy: (backup: LinodeBackup) => void;
}

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
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
        {formatDuration(
          Duration.fromMillis(
            parseAPIDate(backup.finished).toMillis() -
              parseAPIDate(backup.created).toMillis()
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
