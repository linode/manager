import * as React from 'react';
import BackupStatus from 'src/components/BackupStatus';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
} from 'src/components/core/styles';
import TableCell from 'src/components/TableCell';

type ClassNames = 'root';

const styles: StyleRulesCallback<ClassNames> = theme => ({
  root: {
    width: '15%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  }
});

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const LinodeRowBackupCell: React.StatelessComponent<CombinedProps> = props => {
  const { classes, mostRecentBackup, backupsEnabled, linodeId } = props;

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

const styled = withStyles(styles);

export default styled(LinodeRowBackupCell);
