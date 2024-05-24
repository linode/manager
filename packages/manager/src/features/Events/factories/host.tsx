import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const host: PartialEventMap = {
  host_reboot: {
    failed: (e) => (
      <>
        Linode <EventMessageLink entity={e.entity} /> could <strong>not</strong>{' '}
        be <strong>booted</strong> (Host initiated restart).
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>booted</strong> (Host initiated restart).
      </>
    ),

    scheduled: (e) => (
      <>
        Linode <EventMessageLink entity={e.entity} /> is scheduled for a{' '}
        <strong>reboot</strong> (Host initiated restart).
      </>
    ),

    started: (e) => (
      <>
        Linode <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>booted</strong> (Host initiated restart).
      </>
    ),
  },
};
