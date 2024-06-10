import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const lassie: PartialEventMap<'lassie'> = {
  lassie_reboot: {
    failed: (e) => (
      <>
        Linode could <strong>not</strong> be <strong>booted</strong> by the
        Lassie watchdog service.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>booted</strong> by the Lassie watchdog service.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>rebooted</strong> by the Lassie watchdog service.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>booted</strong> by the Lassie watchdog service.
      </>
    ),
  },
};
