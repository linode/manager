import Backup from '@mui/icons-material/Backup';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Tooltip from 'src/components/core/Tooltip';
import Typography from 'src/components/core/Typography';
import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import Link from 'src/components/Link';
import { TooltipIcon } from 'src/components/TooltipIcon/TooltipIcon';
import { makeStyles } from 'tss-react/mui';

const useStyles = makeStyles<void, 'icon'>()(
  (theme: Theme, _params, classes) => ({
    backupLink: {
      '&:hover': {
        [`& .${classes.icon}`]: {
          fill: theme.palette.primary.main,
        },
      },
      display: 'flex',
    },
    backupNotApplicable: {
      marginRight: theme.spacing(),
    },
    backupScheduledOrNever: {
      marginRight: theme.spacing(),
    },
    backupText: {
      whiteSpace: 'nowrap',
    },
    icon: {
      fill: theme.color.grey1,
      fontSize: 18,
    },
    tooltip: {
      maxWidth: 275,
    },
    withTooltipIcon: {
      alignItems: 'center',
      display: 'flex',
    },
    wrapper: {
      alignContent: 'center',
      display: 'flex',
    },
  })
);

interface Props {
  mostRecentBackup: string | null;
  linodeId: number;
  backupsEnabled: boolean;
  isBareMetalInstance?: boolean;
}

const BackupStatus = (props: Props) => {
  const {
    backupsEnabled,
    isBareMetalInstance,
    linodeId,
    mostRecentBackup,
  } = props;

  const { classes } = useStyles();

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
      <div className={classes.withTooltipIcon}>
        <Typography variant="body1" className={classes.backupNotApplicable}>
          N/A
        </Typography>
        <TooltipIcon
          text={backupsUnavailableMessage}
          sxTooltipIcon={{
            padding: 0,
          }}
          classes={{ tooltip: classes.tooltip }}
          interactive
          status="help"
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

export { BackupStatus };
