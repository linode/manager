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
  stream_delete: {
    notification: (e) => (
      <>
        Stream <EventLink event={e} to="entity" /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  stream_update: {
    notification: (e) => (
      <>
        Stream <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
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
  destination_delete: {
    notification: (e) => (
      <>
        Destination <EventLink event={e} to="entity" /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  destination_update: {
    notification: (e) => (
      <>
        Destination <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
