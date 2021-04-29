import Backup from '@material-ui/icons/Backup';
import * as React from 'react';
import { Link } from 'react-router-dom';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HelpIcon from 'src/components/HelpIcon';

type ClassNames =
  | 'icon'
  | 'backupScheduledOrNever'
  | 'backupNotApplicable'
  | 'root'
  | 'wrapper'
  | 'helpIcon'
  | 'withHelpIcon'
  | 'backupLink'
  | 'backupText';

const styles = (theme: Theme) =>
  createStyles({
    icon: {
      fontSize: 18,
      fill: theme.color.grey1,
    },
    backupScheduledOrNever: {
      marginRight: theme.spacing(1),
    },
    backupNotApplicable: {
      marginRight: theme.spacing(2.2),
    },
    root: {},
    wrapper: {
      display: 'flex',
      alignContent: 'center',
    },
    helpIcon: {
      color: theme.color.grey1,
      '& :hover': {
        color: '#4d99f1',
        backgroundColor: 'transparent',
      },
      padding: 0,
      '& svg': {
        fontSize: 0,
        height: 20,
        width: 20,
      },
    },
    withHelpIcon: {
      display: 'flex',
      alignItems: 'center',
    },
    backupLink: {
      display: 'flex',
      '&:hover': {
        '& $icon': {
          fill: theme.palette.primary.main,
        },
      },
    },
    backupText: {
      whiteSpace: 'nowrap',
    },
  });

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
  isBareMetalInstance?: boolean;
}

type CombinedProps = Props & WithStyles<ClassNames>;

const BackupStatus: React.FC<CombinedProps> = (props) => {
  const {
    classes,
    mostRecentBackup,
    linodeId,
    backupsEnabled,
    isBareMetalInstance,
  } = props;

  const backupsUnavailableMessage =
    'Backups are unavailable for Bare Metal instances.';

  if (mostRecentBackup) {
    return (
      <Typography variant="body1" className={classes.backupText}>
        <DateTimeDisplay value={mostRecentBackup} displayTime />
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
            <Typography
              variant="body1"
              className={classes.backupScheduledOrNever}
            >
              Scheduled
            </Typography>
          </Link>
        </Tooltip>
      </div>
    );
  }

  if (isBareMetalInstance) {
    return (
      <div className={classes.withHelpIcon}>
        <Typography variant="body1" className={classes.backupNotApplicable}>
          N/A
        </Typography>
        <HelpIcon
          text={backupsUnavailableMessage}
          className={classes.helpIcon}
        />
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
          <Typography
            variant="body1"
            className={classes.backupScheduledOrNever}
          >
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
