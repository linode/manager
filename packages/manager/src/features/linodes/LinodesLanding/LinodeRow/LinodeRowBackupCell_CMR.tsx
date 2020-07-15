import * as React from 'react';
import { compose } from 'recompose';
import BackupStatus from 'src/components/BackupStatus';
import { makeStyles, Theme } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    borderTop: 'none',
    padding: '10px 15px',
    width: '14%',
    [theme.breakpoints.down('sm')]: {
      borderRight: `1px solid ${theme.palette.divider}`
    }
  }
}));

interface Props {
  linodeId: number;
  mostRecentBackup: string | null;
  backupsEnabled: boolean;
}

type CombinedProps = Props;

const LinodeRowBackupCell: React.FC<CombinedProps> = props => {
  const classes = useStyles();

  const { linodeId, backupsEnabled, mostRecentBackup } = props;

  return (
    <TableCell className={classes.root}>
      <BackupStatus
        linodeId={linodeId}
        backupsEnabled={backupsEnabled}
        mostRecentBackup={mostRecentBackup}
      />
    </TableCell>
  );
};

export default compose<CombinedProps, Props>(React.memo)(LinodeRowBackupCell);
