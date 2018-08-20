import * as moment from 'moment-timezone';
import * as React from 'react';

import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';

import { formatBackupDate } from './LinodeBackup';
import LinodeBackupActionMenu from './LinodeBackupActionMenu';

interface Props {
  backup: Linode.LinodeBackup;
  handleRestore: (backup:Linode.LinodeBackup) => void;
  handleDeploy: (backup:Linode.LinodeBackup) => void;
}

const typeMap = {
  auto: 'Automatic',
  snapshot: 'Manual',
};

const BackupTableRow:React.StatelessComponent<Props> = (props) => {
  const onDeploy = () => {
    props.handleDeploy(props.backup);
  }
  const { backup, handleRestore } = props;
  return (
    <TableRow key={backup.id} data-qa-backup>
      <TableCell>
        {formatBackupDate(backup.created)}
      </TableCell>
      <TableCell data-qa-backup-name>
        {backup.label || typeMap[backup.type]}
      </TableCell>
      <TableCell>
        {moment.duration(
          moment(backup.finished).diff(moment(backup.created)),
        ).humanize()}
      </TableCell>
      <TableCell data-qa-backup-disks>
        {backup.disks.map((disk, idx) => (
          <div key={idx}>
            {disk.label} ({disk.filesystem}) - {disk.size}MB
          </div>
        ))}
      </TableCell>
      <TableCell data-qa-space-required>
        {backup.disks.reduce((acc, disk) => (
          acc + disk.size
        ), 0)}MB
      </TableCell>
      <TableCell>
        <LinodeBackupActionMenu
          backup={backup}
          onRestore={handleRestore}
          onDeploy={onDeploy}
        />
      </TableCell>
    </TableRow>
  );
}

export default BackupTableRow;