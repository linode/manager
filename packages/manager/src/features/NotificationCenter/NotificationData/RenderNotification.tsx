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
    display: 'flex',
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

  const isMaintenanceNotification = [
    'maintenance',
    'maintenance_scheduled',
    'migration_pending'
  ].includes(notification.type);

  const linkTarget =
    // payment_due notifications do not have an entity property, so in that case, link directly to /account/billing
    notification?.type === 'payment_due'
      ? '/account/billing'
      : getEntityLinks(notification?.entity?.type, notification?.entity?.id);

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
          {isMaintenanceNotification ? (
            linkifiedMaintenanceMessage(notification)
          ) : notification.type === 'ticket_abuse' ? (
            linkifiedAbuseTicketMessage(notification)
          ) : linkTarget ? (
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

const getEntityLinks = (type?: string, id?: number) => {
  if (!type) {
    return;
  }

  switch (type) {
    case 'linode':
      return `/linodes/${id}`;

    case 'ticket_abuse':
      return `/support/tickets/${id}`;

    default:
      return;
  }
};

const linkifiedAbuseTicketMessage = (notification: Notification) => {
  return (
    <Typography>
      {notification.message}{' '}
      <Link to={notification!.entity!.url}>
        Click here to view this ticket.
      </Link>
    </Typography>
  );
};

const linkifiedMaintenanceMessage = (notification: Notification) => {
  return (
    <Typography>
      <Link to={`/linodes/${notification?.entity?.id ?? ''}`}>
        {notification?.entity?.label ?? 'One of your Linodes'}
      </Link>{' '}
      resides on a host that is pending critical maintenance. You should have
      received a <Link to={'/support/tickets?type=open'}>support ticket</Link>{' '}
      that details how you will be affected. Please see the aforementioned
      ticket and{' '}
      <Link to={'https://status.linode.com/'}>status.linode.com</Link> for more
      details.
    </Typography>
  );
};

export default React.memo(RenderNotification);
