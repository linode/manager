import { Event } from '@linode/api-v4/lib/account/types';
import { path } from 'ramda';
import * as React from 'react';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import EntityIcon, { Variant } from 'src/components/EntityIcon';
import Grid from 'src/components/Grid';
import { Link } from 'src/components/Link';
import eventMessageGenerator from 'src/eventMessageGenerator';
import { formatEventWithUsername } from 'src/features/Events/Event.helpers';
import formatDate from 'src/utilities/formatDate';
import {
  getEntityByIDFromStore,
  EntityType
} from 'src/utilities/getEntityByIDFromStore';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import { formatEventSeconds } from 'src/utilities/minute-conversion/minute-conversion';

const useStyles = makeStyles((theme: Theme) => ({
  link: {
    '&:hover': {
      textDecoration: 'none'
    }
  },
  icon: {
    marginRight: theme.spacing()
  },
  eventMessage: {
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  timeStamp: {
    textAlign: 'right'
  },
  unseenEvent: {
    fontWeight: 'bold'
  }
}));

interface Props {
  event: Event;
}

export type CombinedProps = Props;

export const RenderEvent: React.FC<Props> = props => {
  const { event } = props;
  const classes = useStyles();

  const message = eventMessageGenerator(event);
  const messageWithUsername = formatEventWithUsername(
    event.action,
    event.username,
    message
  );

  if (message === null) {
    return null;
  }

  const type = event.entity?.type ?? 'linode';

  const entity = getEntityByIDFromStore(
    type as EntityType,
    event.entity?.id ?? -1
  );

  const status = path<string>(['status'], entity);

  const duration = formatEventSeconds(event.duration);

  const linkTarget = createLinkHandlerForNotification(
    event.action,
    event.entity,
    false
  );

  const unseenEventClass = event.seen ? '' : classes.unseenEvent;

  const eventMessage = (
    <Typography className={`${unseenEventClass} ${classes.eventMessage}`}>
      {messageWithUsername}
      {event.duration
        ? event.status === 'failed'
          ? ` (failed after ${duration})`
          : ` (completed in ${duration})`
        : null}
    </Typography>
  );

  return (
    <Grid
      container
      direction="row"
      alignItems="flex-start"
      justify="space-between"
    >
      <Grid item xs={8}>
        <Grid container alignItems="center" wrap="nowrap">
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
              <Link to={linkTarget}>{eventMessage}</Link>
            ) : (
              eventMessage
            )}
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={4} className={classes.timeStamp}>
        <Typography className={unseenEventClass}>
          {formatDate(event.created)}
        </Typography>
      </Grid>
    </Grid>
  );
};

export default React.memo(RenderEvent);
