import Backup from '@material-ui/icons/Backup';
import * as React from 'react';
import {
  StyleRulesCallback,
  withStyles,
  WithStyles
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

const styles: StyleRulesCallback<ClassNames> = theme => ({
  icon: {
    fontSize: 18,
    fill: theme.color.grey1
  },
  noBackupText: {
    marginRight: '8px'
  },
  root: {},
  wrapper: {
    display: 'flex',
    alignContent: 'center'
  },
  backupLink: {
    display: 'flex'
  },
  backupText: {
    whiteSpace: 'nowrap'
  }
});

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BackupStatus: React.StatelessComponent<CombinedProps> = props => {
  const { classes, mostRecentBackup, linodeId } = props;

  return (
    <React.Fragment>
      {mostRecentBackup ? (
        <Typography variant="body1" className={classes.backupText}>
          <DateTimeDisplay value={mostRecentBackup} humanizeCutoff={'never'} />
        </Typography>
      ) : (
        <div className={classes.wrapper}>
          <Tooltip title="Enable Backups" placement={'right'}>
            <a
              aria-label={'Enable Backups'}
              href={`/linodes/${linodeId}/backup`}
              className={classes.backupLink}
            >
              <Typography variant="body1" className={classes.noBackupText}>
                Never
              </Typography>
              <Backup className={`${classes.icon} backupIcon`} />
            </a>
          </Tooltip>
        </div>
      )}
    </React.Fragment>
  );
};

const styled = withStyles(styles);

export default styled(BackupStatus);
