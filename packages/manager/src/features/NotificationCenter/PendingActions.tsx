import { Duration } from 'luxon';
import * as React from 'react';
import BarPercent from 'src/components/BarPercent/BarPercent_CMR';
import { makeStyles, Theme } from 'src/components/core/styles';
import Typography from 'src/components/core/Typography';
import useEvents from 'src/hooks/useEvents';
import useLinodes from 'src/hooks/useLinodes';
import { useTypes } from 'src/hooks/useTypes';
import { isInProgressEvent } from 'src/store/events/event.helpers';
import { ExtendedEvent } from 'src/store/events/event.types';
import {
  eventMessageGenerator,
  eventLabelGenerator
} from 'src/eventMessageGenerator_CMR';
import NotificationSection, { NotificationItem } from './NotificationSection';
import createLinkHandlerForNotification from 'src/utilities/getEventsActionLinkStrings';
import { Link } from 'src/components/Link';
import { reducer } from './eventQueue';

const useStyles = makeStyles((theme: Theme) => ({
  action: {
    display: 'flex',
    flexFlow: 'column nowrap'
  },
  bar: {
    marginTop: theme.spacing()
  }
}));

export const PendingActions: React.FC<{}> = _ => {
  const classes = useStyles();
  const { events } = useEvents();
  const { linodes } = useLinodes();
  const { types } = useTypes();
  const _linodes = Object.values(linodes.itemsById);
  const _types = types.entities;

  const [state, dispatch] = React.useReducer(reducer, {
    inProgressEvents: events.filter(isInProgressEvent),
    completedEvents: []
  });

  React.useEffect(() => {
    dispatch({ type: 'update', payload: { eventsFromRedux: events } });
  }, [events]);

  const formatEventForDisplay = React.useCallback(
    (event: ExtendedEvent): NotificationItem | null => {
      const message = eventMessageGenerator(event, _linodes, _types);
      if (message === null) {
        return null;
      }
      const timeRemaining = event.time_remaining
        ? ` (~${formatTimeRemaining(event.time_remaining)})`
        : null;
      const linkTarget = createLinkHandlerForNotification(
        event.action,
        event.entity,
        false
      );
      const label = linkTarget ? (
        <Link to={linkTarget}>{eventLabelGenerator(event)}</Link>
      ) : (
        event.entity?.label
      );
      return {
        id: `pending-action-${event.id}`,
        body: (
          <div className={classes.action}>
            <Typography>
              {label}
              {` `}
              {message}
              {timeRemaining}
            </Typography>
            {event.percent_complete ?? 0 < 100 ? (
              <BarPercent
                className={classes.bar}
                max={100}
                value={event.percent_complete ?? 0}
                rounded
                narrow
              />
            ) : (
              <Typography>Complete</Typography>
            )}
          </div>
        )
      };
    },
    [classes, _linodes, _types]
  );

  const allEvents = [...state.inProgressEvents, ...state.completedEvents];

  const actions = allEvents
    .map(formatEventForDisplay)
    .filter(Boolean) as NotificationItem[];

  return (
    <NotificationSection
      content={actions}
      header="Pending Actions"
      showMoreTarget={'/events'}
      emptyMessage="There are no pending actions."
    />
  );
};

export const formatTimeRemaining = (time: string) => {
  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (
      [hours, minutes, seconds].some(
        thisNumber => typeof thisNumber === 'undefined'
      ) ||
      [hours, minutes, seconds].some(isNaN)
    ) {
      // Bad input, don't display a duration
      return null;
    }
    const duration = Duration.fromObject({ hours, minutes, seconds });
    return hours > 0
      ? `${Math.round(duration.as('hours'))} hours remaining`
      : `${Math.round(duration.as('minutes'))} minutes remaining`;
  } catch {
    // Broken/unexpected input
    return null;
  }
};

export default React.memo(PendingActions);
