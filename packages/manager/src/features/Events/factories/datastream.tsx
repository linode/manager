import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const stream: PartialEventMap<'stream'> = {
  stream_create: {
    notification: (e) => (
      <>
        Stream <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
};

export const destination: PartialEventMap<'destination'> = {
  destination_create: {
    notification: (e) => (
      <>
        Destination <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
};
