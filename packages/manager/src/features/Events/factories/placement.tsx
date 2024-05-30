import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const placement: PartialEventMap<'placement'> = {
  placement_group_assign: {
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>assigned</strong> to Placement Group{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  placement_group_became_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventLink event={e} to="entity" /> has become{' '}
        <strong>compliant</strong>.
      </>
    ),
  },
  placement_group_became_non_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventLink event={e} to="entity" /> has become{' '}
        <strong>non-compliant</strong>.
      </>
    ),
  },
  placement_group_create: {
    notification: (e) => (
      <>
        Placement Group <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  placement_group_delete: {
    notification: (e) => (
      <>
        Placement Group {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  placement_group_unassign: {
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>unassigned</strong> from Placement Group{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  placement_group_update: {
    notification: (e) => (
      <>
        Placement Group <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
