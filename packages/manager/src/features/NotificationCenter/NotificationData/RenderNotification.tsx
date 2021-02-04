import * as classNames from 'classnames';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import formatDate from 'src/utilities/formatDate';
import { Notification } from '@linode/api-v4/lib/account';
import Warning from 'src/assets/icons/warning.svg';
import Error from 'src/assets/icons/alert.svg';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2
  },
  divider: {
    marginTop: theme.spacing()
  },
  notificationText: {
    fontWeight: 'bold'
  },
  critical: {
    fill: theme.color.red,
    '& svg': {
      fill: theme.color.red
    }
  },
  major: {
    // fill:
  },
  severeAlert: {
    color: theme.color.red
  },
  notificationIcon: {
    lineHeight: '1rem',
    '& svg': {
      height: 18,
      width: 18
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

  const linkTarget = getEntityLink(
    notification?.entity?.type,
    notification?.entity?.id
  );

  const message = (
    <Typography
      className={classNames({
        [classes.notificationText]: true,
        [classes.severeAlert]: notification.severity === 'critical'
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
            {notification.severity === 'critical' && (
              <Error className={classes.critical} />
            )}
            {notification.severity === 'major' && (
              <Warning className={classes.major} />
            )}
          </div>
        </Grid>

        <Grid item>
          {linkTarget ? <Link to={linkTarget}>{message}</Link> : message}
        </Grid>
      </Grid>
      <Divider className={classes.divider} />
    </>
  );
};

const getEntityLink = (type?: string, id?: number) => {
  if (!type || !id) {
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
