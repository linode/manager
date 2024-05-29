import { eventMessages } from './factory';

import type { Event } from '@linode/api-v4';

type EventMessageManualInput = {
  action: Event['action'];
  entity?: Partial<Event['entity']>;
  secondary_entity?: Partial<Event['secondary_entity']>;
  status: Event['status'];
};

/**
 * Defining two function signatures for getEventMessage
 * - One that takes a full Event object (event page and notification center)
 * - Another that takes an object with action, status, entity, and secondary_entity (getting a message for a snackbar for instance, where we manually pass the action & status).
 * Using typescript overloads to allow for both Event and EventMessageInput types.
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
