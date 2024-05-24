import * as React from 'react';

import { Typography } from 'src/components/Typography';

import {
  account,
  backup,
  community,
  creditCard,
  database,
  disk,
  dns,
  domain,
  entity,
  firewall,
  host,
  image,
  ip,
  lassie,
  linode,
  placementGroup,
} from './factories';

import type { CompleteEventMap, EventMessage, PartialEventMap } from './types';
import type { Event } from '@linode/api-v4';

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
  ...withTypography(account),
  ...withTypography(backup),
  ...withTypography(community),
  ...withTypography(creditCard),
  ...withTypography(database),
  ...withTypography(disk),
  ...withTypography(dns),
  ...withTypography(domain),
  ...withTypography(entity),
  ...withTypography(firewall),
  ...withTypography(host),
  ...withTypography(image),
  ...withTypography(ip),
  ...withTypography(lassie),
  ...withTypography(linode),
  ...withTypography(placementGroup),
};
