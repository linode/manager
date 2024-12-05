import { Typography } from '@linode/ui';
import * as React from 'react';

import * as factories from './factories';

import type { EventMap, OptionalEventMap } from './types';
import type { Event } from '@linode/api-v4';

/**
 * The event Message Mapper
 *
 * It aggregates all the event messages from the factories and wraps them with Typography.
 * The typography intentionally wraps the message in a span to prevent nested paragraphs while adhering to the design system's typography.
 */

const wrapWithTypography = (
  Component: (e: Partial<Event>) => JSX.Element | string
) => {
  return (e: Partial<Event>) => {
    const result = Component(e);
    return <Typography component="span">{result}</Typography>;
  };
};

export const withTypography = (eventMap: EventMap): OptionalEventMap => {
  return Object.fromEntries(
    Object.entries(eventMap).map(([action, statuses]) => [
      action,
      Object.fromEntries(
        Object.entries(statuses).map(([status, func]) => [
          status,
          wrapWithTypography(func),
        ])
      ),
    ])
  );
};

export const eventMessages: EventMap = Object.keys(factories).reduce(
  (acc, factoryName) => ({
    ...acc,
    ...withTypography((factories as any)[factoryName]),
  }),
  {} as EventMap
);
