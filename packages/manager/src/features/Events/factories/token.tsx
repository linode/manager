import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const token: PartialEventMap<'token'> = {
  token_create: {
    notification: (e) => (
      <>
        Token <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  token_delete: {
    notification: (e) => (
      <>
        Token {e.entity?.label} has been <strong>revoked</strong>.
      </>
    ),
  },
  token_update: {
    notification: (e) => (
      <>
        Token <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
