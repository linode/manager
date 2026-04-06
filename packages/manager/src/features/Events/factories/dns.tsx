import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const dns: PartialEventMap<'dns'> = {
  dns_record_create: {
    notification: (e) => (
      <>
        DNS record has been <strong>added</strong> to{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  dns_record_delete: {
    notification: (e) => (
      <>
        DNS record has been <strong>removed</strong> from{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  dns_zone_create: {
    notification: (e) => (
      <>
        DNS zone has been <strong>added</strong> to{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  dns_zone_delete: {
    notification: (e) => (
      <>
        DNS zone has been <strong>removed</strong> from{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
};
