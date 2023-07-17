import Backup from '@mui/icons-material/Backup';
import { Theme } from '@mui/material/styles';
import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from 'tss-react/mui';

import { DateTimeDisplay } from 'src/components/DateTimeDisplay';
import { Link } from 'src/components/Link';
import { Tooltip } from 'src/components/Tooltip';
import { TooltipIcon } from 'src/components/TooltipIcon';
import { Typography } from 'src/components/Typography';

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
  backupsEnabled: boolean;
  isBareMetalInstance?: boolean;
  linodeId: number;
  mostRecentBackup: null | string;
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
      <Typography className={classes.backupText} variant="body1">
        <DateTimeDisplay displayTime value={mostRecentBackup} />
      </Typography>
    );
  }

  if (backupsEnabled) {
    return (
      <div className={classes.wrapper}>
        <Tooltip placement={'right'} title="Edit Backups">
          <RouterLink
            aria-label={'Edit Backups'}
            className={classes.backupLink}
            to={`/linodes/${linodeId}/backup`}
          >
            <Typography
              className={classes.backupScheduledOrNever}
              variant="body1"
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
        <Typography className={classes.backupNotApplicable} variant="body1">
          N/A
        </Typography>
        <TooltipIcon
          sxTooltipIcon={{
            padding: 0,
          }}
          classes={{ tooltip: classes.tooltip }}
          interactive
          status="help"
          text={backupsUnavailableMessage}
        />
      </div>
    );
  }

  return (
    <div className={classes.wrapper}>
      <Tooltip placement={'right'} title="Enable Backups">
        <RouterLink
          aria-label={'Enable Backups'}
          className={classes.backupLink}
          to={`/linodes/${linodeId}/backup`}
        >
          <Typography
            className={classes.backupScheduledOrNever}
            variant="body1"
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
