import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const linodeInterface: PartialEventMap<'interface'> = {
  interface_create: {
    notification: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong> for Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  interface_delete: {
    notification: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>deleted</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  interface_update: {
    notification: (e) => (
      <>
        Linode Interface <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong> on Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
};
