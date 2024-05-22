import { account } from './event.factories/account';

import type { Event, EventAction, EventStatus } from '@linode/api-v4';

type EventMessage = { [S in EventStatus]?: (e: Event) => JSX.Element | string };

export type PartialEventMap = {
  [K in EventAction]?: EventMessage;
};

export type EventMap = {
  [K in EventAction]?: EventMessage;
};

export const events: EventMap = {
  ...account,
};

export const factorEventMessage = (e: Event): EventMessage => {
  const action = events[e.action];

  // console.log(action)

  if (!action) {
    // send sentry event
    return {};
  }

  return action;
};
