import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const vlan: PartialEventMap<'vlan'> = {
  vlan_attach: {
    notification: (e) => (
      <>
        VLAN <EventLink event={e} to="entity" /> has been{' '}
        <strong>attached</strong>.
      </>
    ),
  },
  vlan_detach: {
    notification: (e) => (
      <>
        VLAN <EventLink event={e} to="entity" /> has been{' '}
        <strong>detached</strong>.
      </>
    ),
  },
};
