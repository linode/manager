import { Event, EventAction } from 'linode-js-sdk/lib/account';
import * as moment from 'moment';
import { equals } from 'ramda';

/**
 * The point of this function is to ensure we don't have an activity stream
 * that looks like:
 *
 * Linode hello_world has been booted
 * Linode hello_world has been created
 * Linode hello_world is scheduled to be booted
 * Linode hello_world is scheduled to be created
 *
 * Basically, we're creating a cache and only adding to the cache if the Event
 * ID doesn't already exist in the cache. This ensures that "has been created"
 * events will replace the "is scheduled to" events
 */
export const filterUniqueEvents = (events: Event[]) => {
  return events.reduce((acc, event) => {
    const foundEventInAcc = acc.some(
      (eachAccumEvent: Event) => eachAccumEvent.id === event.id
    );
    return foundEventInAcc ? acc : [...acc, event];
  }, []);
};

/**
 * Takes in the inProgressEvents which are sourced from Redux. These are a key-value
 * pair where the key is the ID of the event in progress and the value is the percent_complete
 * So it ends up comparing the values similar to
 *
 * {
 *    1234: 50
 * }
 *
 * and
 *
 * {
 *   1234: 79
 * }
 *
 * the "50" and the "79" are the things being compared
 */
export const percentCompleteHasUpdated = (
  prevEventsInProgress: Record<number, number>,
  nextEventsInProgress: Record<number, number>
) => {
  return Object.keys(prevEventsInProgress).some(
    eachEventID =>
      prevEventsInProgress[eachEventID] !== nextEventsInProgress[eachEventID]
  );
};

interface Payload {
  mostRecentEventTime: string;
  inProgressEvents: Record<number, number>;
}

/**
 * shouldComponentUpdate logic to determine if the list of events should update
 *
 * This is abstracted because it's shared logic between the EventsLanding the Activity Summary
 */
export const shouldUpdateEvents = (prevProps: Payload, nextProps: Payload) => {
  return (
    !equals(prevProps.mostRecentEventTime, nextProps.mostRecentEventTime) ||
    (!equals(prevProps.inProgressEvents, nextProps.inProgressEvents) ||
      percentCompleteHasUpdated(
        prevProps.inProgressEvents,
        nextProps.inProgressEvents
      ))
  );
};

export const maybeRemoveTrailingPeriod = (string: string) => {
  const lastChar = string[string.length - 1];
  if (lastChar === '.') {
    return string.substr(0, string.length - 1);
  }
  return string;
};

export const formatEventWithUsername = (
  action: EventAction,
  username: string | null,
  message: string,
  eventDuration: Event['duration']
) => {
  const baseMessage =
    username && action !== 'lassie_reboot'
      ? /**
         * The event message for Lassie events already includes "by the Lassie Watchdog service",
         * so we don't want to add "by Linode" after that.
         */
        `${maybeRemoveTrailingPeriod(message)} by ${username}.`
      : message;

  return !!eventDuration && eventDuration > 0
    ? `(took ${moment.duration(eventDuration).humanize()}) ${baseMessage}`
    : baseMessage;
};
