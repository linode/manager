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

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2
  },
  divider: {
    marginTop: theme.spacing()
  },
  notificationText: {
    fontWeight: 'bold',
    marginLeft: '0.5rem'
  }
}));

interface Props {
  notification: Notification;
}

export type CombinedProps = Props;

export const RenderNotification: React.FC<Props> = props => {
  const { notification } = props;
  const classes = useStyles();

  //   const eventMessage = (
  //     <Typography
  //       className={classNames({
  //         [classes.unseenEvent]: !event.seen,
  //         [classes.eventMessage]: !!linkTarget
  //       })}
  //     >
  //       {message}
  //       {event.duration
  //         ? event.status === 'failed'
  //           ? ` (Failed after ${duration})`
  //           : ` (Completed in ${duration})`
  //         : null}
  //     </Typography>
  //   );

  return (
    <>
      <Grid container className={classes.root} justify="space-between">
        <Grid item xs={8}>
          <Grid container wrap="nowrap">
            <Typography className={classes.notificationText}>
              {`${notification.message}`}
            </Typography>
            {/* <Grid item>
              {linkTarget ? (
                <Link to={linkTarget}>{eventMessage}</Link>
              ) : (
                eventMessage
              )}
            </Grid> */}
          </Grid>
        </Grid>
        {/* <Grid item xs={4} className={classes.timeStamp}>
          <Typography
            className={classNames({ [classes.unseenEvent]: !event.seen })}
          >
            {formatDate(event.created)}
          </Typography>
        </Grid> */}
      </Grid>
      <Divider className={classes.divider} />
    </>
  );
};

export default React.memo(RenderNotification);
