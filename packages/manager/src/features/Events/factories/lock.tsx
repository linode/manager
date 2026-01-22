import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const lock: PartialEventMap<'lock'> = {
  lock_create: {
    notification: (e) => (
      <>
        A <strong>resource lock</strong> has been created for{' '}
        {e.secondary_entity ? (
          <EventLink event={e} to="secondaryEntity" />
        ) : (
          'resource'
        )}
        .
      </>
    ),
  },
  lock_delete: {
    notification: (e) => (
      <>
        A <strong>resource lock</strong> has been removed from{' '}
        {e.secondary_entity ? (
          <EventLink event={e} to="secondaryEntity" />
        ) : (
          'resource'
        )}
        .
      </>
    ),
  },
};
