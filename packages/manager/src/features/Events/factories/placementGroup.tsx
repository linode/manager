import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const placementGroup: PartialEventMap = {
  placement_group_assign: {
    notification: (e) => (
      <>
        Linode{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>assigned</strong> to Placement Group{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  placement_group_became_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has become <strong>compliant</strong>.
      </>
    ),
  },
  placement_group_became_non_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has become <strong>non-compliant</strong>.
      </>
    ),
  },
  placement_group_create: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>created</strong>.
      </>
    ),
  },
  placement_group_delete: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>deleted</strong>.
      </>
    ),
  },
  placement_group_unassign: {
    notification: (e) => (
      <>
        Linode{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>unassigned</strong> from Placement Group{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  placement_group_update: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>updated</strong>.
      </>
    ),
  },
};
