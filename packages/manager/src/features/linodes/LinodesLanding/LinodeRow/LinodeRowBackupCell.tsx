import * as React from 'react';
import { compose } from 'recompose';
import BackupStatus from 'src/components/BackupStatus';
import { makeStyles } from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

const useStyles = makeStyles(() => ({
  root: {
    borderTop: 'none',
    padding: '10px 15px',
    width: '14%',
  },
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
