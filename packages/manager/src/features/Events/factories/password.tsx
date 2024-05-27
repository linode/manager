import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const password: PartialEventMap = {
  password_reset: {
    failed: (e) => (
      <>
        Password for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>reset</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Password for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>reset</strong>.
      </>
    ),

    scheduled: (e) => (
      <>
        Password for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>scheduled</strong>.
      </>
    ),
    started: (e) => (
      <>
        Password for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>reset</strong>.
      </>
    ),
  },
};
