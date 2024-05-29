import * as React from 'react';

import { Typography } from 'src/components/Typography';

import * as factories from './factories';

import type { CompleteEventMap, PartialEventMap } from './types';
import type { Event } from '@linode/api-v4';

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

export const eventMessages: CompleteEventMap = Object.keys(factories).reduce(
  (acc, factoryName) => ({
    ...acc,
    ...withTypography(factories[factoryName]),
  }),
  {}
);
