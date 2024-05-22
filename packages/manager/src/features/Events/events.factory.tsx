import { account } from './event.factories/account';

import type { EventAction, EventStatus } from '@linode/api-v4';

type EventMessage = { [S in EventStatus]?: JSX.Element | string };

export type PartialEventMap = (
  e: Event
) => {
  [K in EventAction]?: EventMessage;
};

type EventMap = {
  [K in EventAction]?: EventMessage;
};

export const events: (e: Event) => EventMap = (e: Event) => ({
  ...account(e),
});
