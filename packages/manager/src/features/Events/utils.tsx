import { eventMessages } from './factory';

import type { EventMessage } from './types';
import type { Event, EventAction } from '@linode/api-v4';

export const getEventMessage = <T extends EventAction>(
  action: T,
  status: keyof EventMessage,
  eventProps?: {
    entity?: Partial<Event['entity']>;
    secondary_entity?: Partial<Event['entity']>;
  }
): JSX.Element | string | undefined => {
  const actionEvents = eventMessages[action];
  const messageFn = actionEvents?.[status];

  return messageFn ? messageFn((eventProps || {}) as Event) : undefined;
};
