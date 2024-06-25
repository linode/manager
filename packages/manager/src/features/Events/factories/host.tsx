import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const host: PartialEventMap<'host'> = {
  host_reboot: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>booted</strong> (Host initiated restart).
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>booted</strong> (Host initiated restart).
      </>
    ),

    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled for a{' '}
        <strong>reboot</strong> (Host initiated restart).
      </>
    ),

    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>booted</strong> (Host initiated restart).
      </>
    ),
  },
};
