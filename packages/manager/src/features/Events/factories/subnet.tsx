import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const subnet: PartialEventMap<'subnet'> = {
  subnet_create: {
    notification: (e) => (
      <>
        Subnet <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong> in VPC{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  subnet_delete: {
    notification: (e) => (
      <>
        Subnet {e.entity?.label} has been <strong>deleted</strong> in VPC{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  subnet_update: {
    notification: (e) => (
      <>
        Subnet <EventLink event={e} to="entity" /> in VPC{' '}
        <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
