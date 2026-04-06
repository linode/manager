import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const lish: PartialEventMap<'lish'> = {
  lish_boot: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>booted</strong> (Lish initiated boot).
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>booted</strong> (Lish initiated boot).
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to{' '}
        <strong>boot</strong> (Lish initiated boot).
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>booted</strong> (Lish initiated boot).
      </>
    ),
  },
};
