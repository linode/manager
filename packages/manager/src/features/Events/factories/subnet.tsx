import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const subnet: PartialEventMap = {
  subnet_create: {
    notification: (e) => (
      <>
        Subnet <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong> in VPC{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} />.
      </>
    ),
  },
  subnet_delete: {
    notification: (e) => (
      <>
        Subnet <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong> in VPC{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} />.
      </>
    ),
  },
  subnet_update: {
    notification: (e) => (
      <>
        Subnet <EventMessageLink action={e.action} entity={e.entity} /> in VPC{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>updated</strong>.
      </>
    ),
  },
};
