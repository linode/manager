import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const obj: PartialEventMap = {
  obj_access_key_create: {
    notification: (e) => (
      <>
        Access Key <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  obj_access_key_delete: {
    notification: (e) => (
      <>
        Access Key {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  obj_access_key_update: {
    notification: (e) => (
      <>
        Access Key <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
