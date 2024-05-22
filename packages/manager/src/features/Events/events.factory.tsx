import { account } from './event.factories/account';
import { withTypography } from './utils';

import type { Event, EventAction, EventStatus } from '@linode/api-v4';

type EventMessage = { [S in EventStatus]?: JSX.Element | string };

export type PartialEventMap = (
  e: Event
) => {
  [K in EventAction]?: EventMessage;
};

export type EventMap = {
  [K in EventAction]?: EventMessage;
};

export const events: (e: Event) => EventMap = withTypography((e: Event) => ({
  ...account(e),
}));
