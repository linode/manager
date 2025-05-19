import { formatDuration } from '@linode/utilities';
import { Duration } from 'luxon';

import { ACTIONS_TO_INCLUDE_AS_PROGRESS_EVENTS } from 'src/features/Events/constants';
import { isInProgressEvent } from 'src/queries/events/event.helpers';
import { parseAPIDate } from 'src/utilities/date';

import { ACTIONS_WITHOUT_USERNAMES } from './constants';
import { eventMessages } from './factory';

import type { Event } from '@linode/api-v4';

type EventMessageManualInput = {
  action: Event['action'];
  entity?: Partial<Event['entity']>;
  secondary_entity?: Partial<Event['secondary_entity']>;
  status: Event['status'];
};

/**
 * The event Message Getter
 * Intentionally avoiding parsing and formatting, and should remain as such.
 *
 * Defining two function signatures for getEventMessage:
 * - A function that takes a full Event object (event page and notification center)
 * - A function that takes an object with action, status, entity, and secondary_entity (getting a message for a snackbar for instance, where we manually pass the action & status)
 *
 * Using typescript overloads allows for both Event and EventMessageInput types.
 *
 * We don't include defaulting to the API message response here because:
 * - we want to control the message output (our types require us to define one) and rather show nothing than a broken message.
 * - the API message is empty 99% of the time and when present, isn't meant to be displayed as a full message, rather a part of it. (ex: `domain_record_create`)
 */
export function getEventMessage(event: Event): JSX.Element | null | string;
export function getEventMessage(
  event: EventMessageManualInput
): JSX.Element | null | string;
export function getEventMessage(
  event: Event | EventMessageManualInput
): JSX.Element | null | string {
  if (!event?.action || !event?.status) {
    return null;
  }

  const message = eventMessages[event?.action]?.[event.status];

  if (!message && import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      `⚠️ No event message factory found for event "${event.action}" with status "${event.status}"`
    );
  }

  return message ? message(event as Event) : null;
}

/**
 * The event username Getter.
 * Returns the username from event or 'Linode' if username is null or excluded by action.
 */
export const getEventUsername = (event: Event) => {
  if (event.username && !ACTIONS_WITHOUT_USERNAMES.includes(event.action)) {
    return event.username;
  }

  return 'Akamai';
};

/**
 * Format the time remaining for an event.
 * This is used for the progress events in the notification center.
 */
export const formatEventTimeRemaining = (time: null | string) => {
  if (!time) {
    return null;
  }

  try {
    const [hours, minutes, seconds] = time.split(':').map(Number);
    if (
      [hours, minutes, seconds].some(
        (thisNumber) => typeof thisNumber === 'undefined'
      ) ||
      [hours, minutes, seconds].some(isNaN)
    ) {
      // Bad input, don't display a duration
      return null;
    }
    const duration = Duration.fromObject({ hours, minutes, seconds });
    return hours > 0
      ? `${Math.round(duration.as('hours'))} ${
          hours > 1 ? 'hours' : 'hour'
        } remaining`
      : `${Math.round(duration.as('minutes'))} minutes remaining`;
  } catch {
    // Broken/unexpected input
    return null;
  }
};

/**
 * Determines if the progress bar should be shown for an event (in the notification center or on the event page).
 *
 * Progress events are determined based on `event.percent_complete` being defined and < 100.
 * However, some events are not worth showing progress for, usually because they complete too quickly.
 * To that effect, we have an `.includes` for progress events.
 * A new action should be added to `ACTIONS_TO_INCLUDE_AS_PROGRESS_EVENTS` to ensure the display of the progress bar.
 *
 * Additionally, we only want to show the progress bar if the event is not in a scheduled state.
 * For some reason the API will return a percent_complete value for scheduled events.
 */
const shouldShowEventProgress = (event: Event): boolean => {
  const isProgressEvent = isInProgressEvent(event);

  return (
    isProgressEvent &&
    ACTIONS_TO_INCLUDE_AS_PROGRESS_EVENTS.includes(event.action) &&
    event.status !== 'scheduled'
  );
};

interface ProgressEventDisplay {
  progressEventDate: string;
  progressEventDuration: string;
  showProgress: boolean;
}

/**
 * Format the event for display in the notification center and event page.
 *
 * If the event is a progress event, we'll show the time remaining, if available.
 * Else, we'll show the time the event occurred, relative to now.
 */
export const formatProgressEvent = (event: Event): ProgressEventDisplay => {
  const showProgress = shouldShowEventProgress(event);
  const startDate = parseAPIDate(event.created).toRelative();
  const progressEventDate = showProgress ? `Started ${startDate}` : startDate;

  const parsedTimeRemaining = formatEventTimeRemaining(event.time_remaining);
  const eventDuration = event.duration
    ? formatDuration(Duration.fromObject({ seconds: event.duration }))
    : '-';
  const progressEventDuration = parsedTimeRemaining
    ? `~${parsedTimeRemaining}`
    : eventDuration;

  return {
    progressEventDate,
    progressEventDuration,
    showProgress,
  };
};
