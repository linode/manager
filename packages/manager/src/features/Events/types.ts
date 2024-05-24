import type { Event, EventAction, EventStatus } from '@linode/api-v4';

export type EventMessage = {
  [S in EventStatus]?: (e: Partial<Event>) => JSX.Element | string;
};

export type PartialEventMap = {
  [K in EventAction]?: EventMessage;
};

export type CompleteEventMap = {
  // remove conditional type when all events are implemented
  [K in EventAction]?: EventMessage;
};
