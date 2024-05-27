import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const oAuth: PartialEventMap = {
  oauth_client_create: {
    notification: (e) => (
      <>
        OAuth App <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>created</strong>.
      </>
    ),
  },
  oauth_client_delete: {
    notification: (e) => (
      <>
        OAuth App <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>deleted</strong>.
      </>
    ),
  },
  oauth_client_secret_reset: {
    notification: (e) => (
      <>
        Secret for OAuth App{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>reset</strong>.
      </>
    ),
  },
  oauth_client_update: {
    notification: (e) => (
      <>
        OAuth App <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>updated</strong>.
      </>
    ),
  },
};
