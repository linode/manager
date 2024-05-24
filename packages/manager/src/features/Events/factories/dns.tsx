import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const dns: PartialEventMap = {
  dns_record_create: {
    notification: (e) => (
      <>
        DNS record has been <strong>added</strong> to{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  dns_record_delete: {
    notification: (e) => (
      <>
        DNS record has been <strong>removed</strong> from{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  dns_zone_create: {
    notification: (e) => (
      <>
        DNS zone has been <strong>added</strong> to{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  dns_zone_delete: {
    notification: (e) => (
      <>
        DNS zone has been <strong>removed</strong> from{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
};
