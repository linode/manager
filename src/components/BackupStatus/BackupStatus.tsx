import Backup from '@material-ui/icons/Backup';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { WithStyles } from '@material-ui/core/styles';
import {
  createStyles,
  Theme,
  withStyles
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';

type ClassNames =
  | 'icon'
  | 'noBackupText'
  | 'root'
  | 'wrapper'
  | 'backupLink'
  | 'backupText';

const styles = (theme: Theme) =>
  createStyles({
  icon: {
    fontSize: 18,
    fill: theme.color.grey1
  },
  noBackupText: {
    marginRight: theme.spacing(1)
  },
  root: {},
  wrapper: {
    display: 'flex',
    alignContent: 'center'
  },
  backupLink: {
    display: 'flex',
    '&:hover': {
      '& $icon': {
        fill: theme.palette.primary.main
      }
    }
  },
  backupText: {
    whiteSpace: 'nowrap'
  }
});

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BackupStatus: React.StatelessComponent<CombinedProps> = props => {
  const { classes, mostRecentBackup, linodeId, backupsEnabled } = props;

  if (mostRecentBackup) {
    return (
      <Typography variant="body1" className={classes.backupText}>
        <DateTimeDisplay value={mostRecentBackup} humanizeCutoff={'never'} />
      </Typography>
    );
  }

  if (backupsEnabled) {
    return (
      <div className={classes.wrapper}>
        <Tooltip title="Edit Backups" placement={'right'}>
          <Link
            aria-label={'Edit Backups'}
            to={`/linodes/${linodeId}/backup`}
            className={classes.backupLink}
          >
            <Typography variant="body1" className={classes.noBackupText}>
              Scheduled
            </Typography>
          </Link>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Tooltip title="Enable Backups" placement={'right'}>
        <Link
          aria-label={'Enable Backups'}
          to={`/linodes/${linodeId}/backup`}
          className={classes.backupLink}
        >
          <Typography variant="body1" className={classes.noBackupText}>
            Never
          </Typography>
          <Backup className={`${classes.icon} backupIcon`} />
        </Link>
      </Tooltip>
    </div>
  );
};

const styled = withStyles(styles);

export default styled(BackupStatus);
