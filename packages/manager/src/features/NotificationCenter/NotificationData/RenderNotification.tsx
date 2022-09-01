import { NotificationType } from '@linode/api-v4/lib/account';
import ErrorIcon from '@material-ui/icons/Error';
import WarningIcon from '@material-ui/icons/Warning';
import classNames from 'classnames';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { sanitizeHTML } from 'src/utilities/sanitize-html';
import { ExtendedNotification } from './useFormattedNotifications';

export const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: -2,
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
    color: `${theme.color.red} !important`,
    '&:hover': {
      textDecoration: `${theme.color.red} underline`,
    },
  },
  notificationIcon: {
    display: 'flex',
    lineHeight: '1rem',
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
        [classes.itemsWithoutIcon]: notification.severity === 'minor',
        [classes.severeAlert]: severity === 'critical',
      })}
      dangerouslySetInnerHTML={{ __html: sanitizeHTML(notification.message) }}
    />
  );

  return (
    <>
      <Grid
        className={classes.root}
        container
        alignItems="flex-start"
        wrap="nowrap"
        data-test-id={notification.type}
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
              className={classNames({
                [classes.redLink]: severity === 'critical',
              })}
              to={linkTarget}
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
  // Handle specific notification types
  if (notificationType === 'ticket_abuse') {
    return `/support/tickets/${id}`;
  }

  // The only entity.type we currently expect and can handle for is "linode"
  return entityType === 'linode' ? `/linodes/${id}` : null;
};

export default React.memo(RenderNotification);
