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
  lish,
  lke,
  longview,
  managed,
  nodeBalancer,
  oAuth,
  obj,
  password,
  payment,
  placementGroup,
  profile,
  stackScript,
  subnet,
  tag,
  tfa,
  ticket,
} from './factories';

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

export const eventMessages: CompleteEventMap = {
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
  ...withTypography(lish),
  ...withTypography(lke),
  ...withTypography(longview),
  ...withTypography(managed),
  ...withTypography(nodeBalancer),
  ...withTypography(oAuth),
  ...withTypography(obj),
  ...withTypography(password),
  ...withTypography(payment),
  ...withTypography(placementGroup),
  ...withTypography(profile),
  ...withTypography(stackScript),
  ...withTypography(subnet),
  ...withTypography(tag),
  ...withTypography(tfa),
  ...withTypography(ticket),
};
