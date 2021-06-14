import { Event } from '@linode/api-v4/lib/account/types';
import * as classNames from 'classnames';
import * as React from 'react';
import Divider from 'src/components/core/Divider';
import { makeStyles } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import { LONG_PENDING_EVENTS } from 'src/store/events/event.helpers';
import formatDate from 'src/utilities/formatDate';
import useEventInfo from './useEventInfo';

const useStyles = makeStyles(() => ({
  root: {
    paddingTop: 2,
    paddingBottom: 2,
  },
  icon: {
    '& svg': {
      height: 20,
      width: 20,
    },
  },
  eventMessage: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
  timeStamp: {
    textAlign: 'right',
  },
  unseenEvent: {
    fontWeight: 'bold',
  },
}));

interface Props {
  event: Event;
  onClose: () => void;
}

export type CombinedProps = Props;

export const RenderEvent: React.FC<Props> = (props) => {
  const { event, onClose } = props;
  const classes = useStyles();

  const { message, duration, type, status, linkTarget } = useEventInfo(event);
  if (message === null) {
    return null;
  }

  const eventMessage = (
    <Typography
      className={classNames({
        [classes.unseenEvent]: !event.seen,
        [classes.eventMessage]: !!linkTarget,
      })}
    >
      {message}
      {event.duration && !LONG_PENDING_EVENTS.includes(event.action)
        ? event.status === 'failed'
          ? ` (Failed after ${duration})`
          : ` (Completed in ${duration})`
        : null}
    </Typography>
  );

  return (
    <>
      <Grid
        container
        className={classes.root}
        justify="space-between"
        data-test-id={event.action}
      >
        <Grid item xs={8}>
          <Grid container wrap="nowrap">
            <Grid item>
              <EntityIcon
                className={classes.icon}
                variant={type as Variant}
                status={status}
                size={25}
              />
            </Grid>
            <Grid item>
              {linkTarget ? (
                <Link to={linkTarget} onClick={onClose}>
                  {eventMessage}
                </Link>
              ) : (
                eventMessage
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4} className={classes.timeStamp}>
          <Typography
            className={classNames({ [classes.unseenEvent]: !event.seen })}
          >
            {formatDate(event.created)}
          </Typography>
        </Grid>
      </Grid>
      <Divider />
    </>
  );
};

export default React.memo(RenderEvent);
