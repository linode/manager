import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const longviewclient: PartialEventMap<'longviewclient'> = {
  longviewclient_create: {
    notification: (e) => (
      <>
        Longview Client <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  longviewclient_delete: {
    notification: (e) => (
      <>
        Longview Client {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  longviewclient_update: {
    notification: (e) => (
      <>
        Longview Client <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
