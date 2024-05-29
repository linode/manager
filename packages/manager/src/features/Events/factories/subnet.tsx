import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const subnet: PartialEventMap = {
  subnet_create: {
    notification: (e) => (
      <>
        Subnet <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>created</strong> in VPC{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  subnet_delete: {
    notification: (e) => (
      <>
        Subnet {e.entity?.label} has been <strong>deleted</strong> in VPC{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  subnet_update: {
    notification: (e) => (
      <>
        Subnet <EventMessageLink event={e} to="entity" /> in VPC{' '}
        <EventMessageLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
