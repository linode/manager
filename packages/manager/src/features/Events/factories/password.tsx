import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const password: PartialEventMap<'password'> = {
  password_reset: {
    failed: (e) => (
      <>
        Password for Linode <EventLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>reset</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Password for Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>reset</strong>.
      </>
    ),

    scheduled: (e) => (
      <>
        Password for Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>scheduled</strong>.
      </>
    ),
    started: (e) => (
      <>
        Password for Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>reset</strong>.
      </>
    ),
  },
};
