import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const managed: PartialEventMap = {
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
        Managed service <EventMessageLink event={e} to="entity" /> has been{' '}
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
