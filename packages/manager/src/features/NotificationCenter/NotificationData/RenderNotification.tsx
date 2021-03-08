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
import { dcDisplayNames } from 'src/constants';
import { reportException } from 'src/exceptionReporting';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { checkIfMaintenanceNotification } from './notificationUtils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  divider: {
    marginTop: theme.spacing(),
  },
  criticalIcon: {
    fill: theme.color.red,
  },
  majorIcon: {
    fill: theme.palette.status.warningDark,
  },
  itemsWithoutIcon: {
    marginLeft: '1.25rem',
  },
  severeAlert: {
    color: theme.color.red,
  },
  redLink: {
    '&:hover': {
      textDecoration: `${theme.color.red} underline`,
    },
  },
  greyLink: {
    '&:hover': {
      textDecoration: `${theme.palette.text.primary} underline`,
    },
  },
  notificationIcon: {
    lineHeight: '1rem',
    display: 'flex',
    '& svg': {
      height: '1.25rem',
      width: '1.25rem',
    },
  },
}));

interface Props {
  notification: Notification;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderNotification: React.FC<Props> = (props) => {
  const { notification, onClose } = props;
  const classes = useStyles();

  const isMaintenanceNotification = checkIfMaintenanceNotification(
    notification.type
  );

  const severity = notification.severity;

  const linkTarget =
    // payment_due notifications do not have an entity property, so in that case, link directly to /account/billing
    notification?.type === 'payment_due'
      ? '/account/billing'
      : getEntityLinks(notification?.entity?.type, notification?.entity?.id);

  const message = (
    <Typography
      className={classNames({
        [classes.severeAlert]: severity === 'critical',
        [classes.itemsWithoutIcon]: notification.severity === 'minor',
      })}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notification.message) }}
    />
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
            {severity === 'critical' ? (
              <ErrorIcon className={classes.criticalIcon} />
            ) : null}
            {severity === 'major' ? (
              <WarningIcon className={classes.majorIcon} />
            ) : null}
          </div>
        </Grid>

        <Grid item>
          {isMaintenanceNotification ? (
            linkifiedMaintenanceMessage(notification, onClose)
          ) : notification.type === 'outage' ? (
            linkifiedOutageMessage(notification)
          ) : notification.type === 'ticket_important' ? (
            linkifiedImportantTicketMessage(notification, onClose)
          ) : linkTarget ? (
            <Link
              to={linkTarget}
              className={classNames({
                [classes.redLink]: severity === 'critical',
                [classes.greyLink]: severity !== 'critical',
              })}
              onClick={onClose}
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
  } else if (type === 'linode') {
    return `/linodes/${id}`;
  } else {
    return;
  }
};

const linkifiedMaintenanceMessage = (
  notification: Notification,
  onClose: () => void
) => {
  return (
    <Typography>
      <Link to={`/linodes/${notification?.entity?.id ?? ''}`} onClick={onClose}>
        {notification?.entity?.label ?? 'One of your Linodes'}
      </Link>{' '}
      resides on a host that is pending critical maintenance. You should have
      received a{' '}
      <Link to={'/support/tickets?type=open'} onClick={onClose}>
        support ticket
      </Link>{' '}
      that details how you will be affected. Please see the aforementioned
      ticket and{' '}
      <Link to={'https://status.linode.com/'}>status.linode.com</Link> for more
      details.
    </Typography>
  );
};

const linkifiedOutageMessage = (notification: Notification) => {
  /** this is an outage to one of the datacenters */
  if (
    notification.type === 'outage' &&
    notification.entity?.type === 'region'
  ) {
    const convertedRegion = dcDisplayNames[notification.entity.id];

    if (!convertedRegion) {
      reportException(
        'Could not find the DC name for the outage notification',
        {
          rawRegion: notification.entity.id,
          convertedRegion,
        }
      );
    }

    return (
      <Typography>
        We are aware of an issue affecting service in{' '}
        {convertedRegion || 'one of our facilities'}. If you are experiencing
        service issues in this facility, there is no need to open a support
        ticket at this time. Please monitor our status blog at{' '}
        <Link to={'https://status.linode.com/'}>https://status.linode.com</Link>{' '}
        for further information. Thank you for your patience and understanding.
      </Typography>
    );
  }

  return notification.message;
};

const linkifiedImportantTicketMessage = (
  notification: Notification,
  onClose: () => void
) => {
  // Failsafe
  if (!notification.entity?.id) {
    return notification.message;
  }

  return (
    <Typography>
      You have an{' '}
      <Link
        to={`/support/tickets/${notification.entity?.id}`}
        onClick={onClose}
      >
        important ticket
      </Link>{' '}
      open!
    </Typography>
  );
};

export default React.memo(RenderNotification);
