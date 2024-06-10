import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const vpc: PartialEventMap<'vpc'> = {
  vpc_create: {
    notification: (e) => (
      <>
        VPC <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  vpc_delete: {
    notification: (e) => (
      <>
        VPC {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  vpc_update: {
    notification: (e) => (
      <>
        VPC <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
