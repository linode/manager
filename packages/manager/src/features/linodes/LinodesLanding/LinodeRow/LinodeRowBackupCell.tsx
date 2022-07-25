import * as React from 'react';
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
  isBareMetalInstance: boolean;
}

const LinodeRowBackupCell = (props: Props) => {
  const classes = useStyles();

  const {
    linodeId,
    backupsEnabled,
    mostRecentBackup,
    isBareMetalInstance,
  } = props;

  return (
    <TableCell className={classes.root}>
      <BackupStatus
        linodeId={linodeId}
        backupsEnabled={backupsEnabled}
        mostRecentBackup={mostRecentBackup}
        isBareMetalInstance={isBareMetalInstance}
      />
    </TableCell>
  );
};

export default React.memo(LinodeRowBackupCell);
