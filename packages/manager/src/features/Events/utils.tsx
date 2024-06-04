import * as React from 'react';

import { BarPercent } from 'src/components/BarPercent';
import { Box } from 'src/components/Box';

import { eventMessages } from './factory';

import type { Event } from '@linode/api-v4';
import type { Theme } from '@mui/material';

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

  return (
    <Box data-test-id={event.action} sx={{ width: '100%' }}>
      {message ? message(event as Event) : null}
      {'percent_complete' in event &&
        event.percent_complete !== null &&
        event.percent_complete < 100 && (
          <BarPercent
            sx={(theme: Theme) => ({
              marginTop: theme.spacing(),
            })}
            max={100}
            narrow
            rounded
            value={event.percent_complete ?? 0}
          />
        )}
    </Box>
  );
}
