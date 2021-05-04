import Backup from '@material-ui/icons/Backup';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles, Theme } from 'src/components/core/styles';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import DateTimeDisplay from 'src/components/DateTimeDisplay';
import HelpIcon from 'src/components/HelpIcon';
import Link from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
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
  tooltip: {
    maxWidth: 275,
  },
  helpIcon: {
    color: theme.color.grey1,
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
}));

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
  isBareMetalInstance?: boolean;
}

type CombinedProps = Props;

const BackupStatus: React.FC<CombinedProps> = (props) => {
  const {
    mostRecentBackup,
    linodeId,
    backupsEnabled,
    isBareMetalInstance,
  } = props;

  const classes = useStyles();

  const backupsUnavailableMessage = (
    <Typography>
      Backups are unavailable for Bare Metal instances. See our{' '}
      <Link to="https://www.linode.com/docs/guides/backing-up-your-data/">
        data backup guide
      </Link>{' '}
      for other options to keep your data safe.
    </Typography>
  );

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
          <RouterLink
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
          </RouterLink>
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
          classes={{ tooltip: classes.tooltip }}
          interactive
        />
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Tooltip title="Enable Backups" placement={'right'}>
        <RouterLink
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
        </RouterLink>
      </Tooltip>
    </div>
  );
};

export default BackupStatus;
