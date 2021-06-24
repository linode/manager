import { LinodeBackup } from '@linode/api-v4/lib/linodes';
import { Duration } from 'luxon';
import * as React from 'react';
import { makeStyles } from 'src/components/core/styles';
import TableRow from 'src/components/core/TableRow';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import TableCell from 'src/components/TableCell';
import { parseAPIDate } from 'src/utilities/date';
import { formatDuration } from 'src/utilities/formatDuration';
import LinodeBackupActionMenu from './LinodeBackupActionMenu';

const useStyles = makeStyles(() => ({
  actionCell: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 0,
    '&.MuiTableCell-root': {
      paddingRight: 0,
    },
  },
}));
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

const BackupTableRow: React.FC<Props> = (props) => {
  const classes = useStyles();
  const { backup, disabled, handleRestore } = props;

  const onDeploy = () => {
    props.handleDeploy(props.backup);
  };

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
            {disk.label} ({disk.filesystem}) - {disk.size} MB
          </div>
        ))}
      </TableCell>
      <TableCell parentColumn="Space Required" data-qa-space-required>
        {backup.disks.reduce((acc, disk) => acc + disk.size, 0)} MB
      </TableCell>
      <TableCell className={classes.actionCell}>
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
