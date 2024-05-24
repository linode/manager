import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../events.factory';

export const placementGroup: PartialEventMap = {
  placement_group_assign: {
    notification: (e) => (
      <>
        Linode <EventMessageLink entity={e.secondary_entity} /> has been{' '}
        <strong>assigned</strong> to Placement Group{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  placement_group_became_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink entity={e.entity} /> has become
        compliant.
      </>
    ),
  },
  placement_group_became_non_compliant: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink entity={e.entity} /> has become
        non-compliant.
      </>
    ),
  },
  placement_group_create: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink entity={e.entity} /> has been created.
      </>
    ),
  },
  placement_group_delete: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink entity={e.entity} /> has been deleted.
      </>
    ),
  },
  placement_group_unassign: {
    notification: (e) => (
      <>
        Linode <EventMessageLink entity={e.secondary_entity} /> has been
        unassigned from Placement Group <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  placement_group_update: {
    notification: (e) => (
      <>
        Placement Group <EventMessageLink entity={e.entity} /> has been updated.
      </>
    ),
  },
};
