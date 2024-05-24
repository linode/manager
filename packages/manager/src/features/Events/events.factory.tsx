import * as React from 'react';

import { Typography } from 'src/components/Typography';

import { account, placementGroup } from './factories';

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

export const factorEventMessage = (e: Event): EventMessage => {
  const action = events[e.action];

  // console.log(action)

  if (!action) {
    // send sentry event
    return {};
  }

  return action;
};

const wrappedWithTypography = (
  Component: (e: Partial<Event>) => JSX.Element | string
) => {
  return (e: Partial<Event>) => {
    const result = Component(e);
    return <Typography component="span">{result}</Typography>;
  };
};

export const withTypography = (eventMap: PartialEventMap): PartialEventMap => {
  return Object.fromEntries(
    Object.entries(eventMap).map(([action, statuses]) => [
      action,
      Object.fromEntries(
        Object.entries(statuses).map(([status, func]) => [
          status,
          wrappedWithTypography(func),
        ])
      ),
    ])
  );
};

export const events: CompleteEventMap = {
  ...account,
  ...withTypography(placementGroup),
};
