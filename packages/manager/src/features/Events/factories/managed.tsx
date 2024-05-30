import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const managed: PartialEventMap<'managed'> = {
  managed_enabled: {
    notification: () => (
      <>
        Managed has been <strong>activated</strong> on your account.
      </>
    ),
  },
  managed_service_create: {
    notification: (e) => (
      <>
        Managed service <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  managed_service_delete: {
    notification: (e) => (
      <>
        Managed service {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
};
