import { Notification } from '@linode/api-v4/lib/account';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import * as classNames from 'classnames';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2
  },
  divider: {
    marginTop: theme.spacing()
  },
  criticalIcon: {
    fill: theme.color.red
  },
  majorIcon: {
    fill: theme.palette.status.warningDark
  },
  severeAlert: {
    color: theme.color.red
  },
  redLink: {
    '&:hover': {
      textDecoration: `${theme.color.red} underline`
    }
  },
  greyLink: {
    '&:hover': {
      textDecoration: `${theme.palette.text.primary} underline`
    }
  },
  notificationIcon: {
    lineHeight: '1rem',
    '& svg': {
      height: '1.25rem',
      width: '1.25rem'
    }
  }
}));

interface Props {
  notification: Notification;
}

export type CombinedProps = Props;

export const RenderNotification: React.FC<Props> = props => {
  const { notification } = props;
  const classes = useStyles();

  const linkTarget =
    // payment_due notifications do not have an entity property, so in that case, link directly to /account/billing
    notification?.type === 'payment_due'
      ? '/account/billing'
      : getEntityLink(notification?.entity?.type, notification?.entity?.id);

  const message = (
    <Typography
      className={classNames({
        [classes.severeAlert]:
          notification.severity === 'critical' &&
          notification.type === 'payment_due'
      })}
    >
      {notification.message}
    </Typography>
  );

  return (
    <>
      <Grid
        container
        className={classes.root}
        wrap="nowrap"
        alignItems="center"
      >
        <Grid item>
          <div className={classes.notificationIcon}>
            {notification.severity === 'critical' ? (
              <ErrorIcon className={classes.criticalIcon} />
            ) : null}
            {notification.severity === 'major' ? (
              <WarningIcon className={classes.majorIcon} />
            ) : null}
          </div>
        </Grid>

        <Grid item>
          {linkTarget ? (
            <Link
              to={linkTarget}
              className={classNames({
                [classes.redLink]: notification.type === 'payment_due',
                [classes.greyLink]: notification.type !== 'payment_due'
              })}
            >
              {message}
            </Link>
          ) : (
            message
          )}
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
    </>
  );
};

const getEntityLink = (type?: string, id?: number) => {
  if (!type) {
    return;
  }

  switch (type) {
    case 'linode':
      return `/linodes/${id}`;

    case 'ticket':
      return `/support/tickets/${id}`;

    case 'payment_due':
      return `/account/billing`;

    default:
      return;
  }
};

export default React.memo(RenderNotification);
