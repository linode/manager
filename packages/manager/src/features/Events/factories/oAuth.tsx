import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const oAuth: PartialEventMap<'oauth'> = {
  oauth_client_create: {
    notification: (e) => (
      <>
        OAuth App <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  oauth_client_delete: {
    notification: (e) => (
      <>
        OAuth App {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  oauth_client_secret_reset: {
    notification: (e) => (
      <>
        Secret for OAuth App <EventLink event={e} to="entity" /> has been{' '}
        <strong>reset</strong>.
      </>
    ),
  },
  oauth_client_update: {
    notification: (e) => (
      <>
        OAuth App <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
