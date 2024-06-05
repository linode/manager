import { eventMessages } from './factory';
import { Duration } from 'luxon';

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

  return message ? message(event as Event) : null;
}

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
      ? `${Math.round(duration.as('hours'))} hours remaining`
      : `${Math.round(duration.as('minutes'))} minutes remaining`;
  } catch {
    // Broken/unexpected input
    return null;
  }
};
