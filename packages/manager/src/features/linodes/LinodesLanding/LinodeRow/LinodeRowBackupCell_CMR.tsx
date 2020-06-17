import * as React from 'react';
import BackupStatus from 'src/components/BackupStatus';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none',
    padding: '10px 15px',
    width: '14%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
}));

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
}

type CombinedProps = Props;

const LinodeRowBackupCell: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { linodeId, backupsEnabled, mostRecentBackup } = props;

  return (
    <TableCell parentColumn="Last Backup" className={classes.root}>
      <BackupStatus
        linodeId={linodeId}
        backupsEnabled={backupsEnabled}
        mostRecentBackup={mostRecentBackup}
      />
    </TableCell>
  );
};

export default LinodeRowBackupCell;
