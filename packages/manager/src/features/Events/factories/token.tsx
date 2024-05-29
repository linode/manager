import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const token: PartialEventMap = {
  token_create: {
    notification: (e) => (
      <>
        Token <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  token_delete: {
    notification: (e) => (
      <>
        Token <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>revoked</strong>.
      </>
    ),
  },
  token_update: {
    notification: (e) => (
      <>
        Token <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
