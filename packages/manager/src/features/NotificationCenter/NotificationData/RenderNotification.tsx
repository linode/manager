import { NotificationType } from '@linode/api-v4/lib/account';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import * as classNames from 'classnames';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { ExtendedNotification } from './useFormattedNotifications';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2,
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
  notification: ExtendedNotification;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderNotification: React.FC<Props> = (props) => {
  const { notification, onClose } = props;
  const classes = useStyles();

  const severity = notification.severity;

  const linkTarget = getEntityLinks(
    notification?.type,
    notification?.entity?.type,
    notification?.entity?.id
  );

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
        data-test-id={notification.type}
        wrap="nowrap"
        alignItems="center"
      >
        <Grid item>
          <div className={classes.notificationIcon}>
            {severity === 'critical' ? (
              <ErrorIcon
                className={classes.criticalIcon}
                data-test-id={severity + 'Icon'}
              />
            ) : null}
            {severity === 'major' ? (
              <WarningIcon
                className={classes.majorIcon}
                data-test-id={severity + 'Icon'}
              />
            ) : null}
          </div>
        </Grid>

        <Grid item>
          {/* If JSX has already been put together from interceptions in useFormattedNotifications.tsx, use that */}
          {notification.jsx ? (
            notification.jsx
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
      <Divider />
    </>
  );
};

const getEntityLinks = (
  notificationType?: NotificationType,
  entityType?: string,
  id?: number
) => {
  // Handle specific notification types ()
  switch (notificationType) {
    case 'ticket_abuse':
      return `/support/tickets/${id}`;
    case 'payment_due':
      return '/account/billing';
    default:
      break;
  }
  // The only entity.type we currently expect and can handle for is "linode."
  return entityType === 'linode' ? `/linodes/${id}` : null;
};

export default React.memo(RenderNotification);
