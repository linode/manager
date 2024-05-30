import type { Event, EventAction, EventStatus } from '@linode/api-v4';

type PrefixByUnderscore<T> = T extends `${infer s}_${string}` ? s : never;

type EventActionPrefixes = PrefixByUnderscore<EventAction>;

export type OptionalEventMap = {
  [K in EventAction]?: EventMessage;
};

export type EventMessage = {
  [S in EventStatus]?: (e: Event) => JSX.Element | string;
};

export type PartialEventMap<Prefix extends EventActionPrefixes> = {
  [K in Extract<EventAction, `${Prefix}_${string}`>]: EventMessage;
};

export type EventMap = {
  [K in EventAction]: EventMessage;
};
