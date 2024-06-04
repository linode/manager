import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const tag: PartialEventMap<'tag'> = {
  tag_create: {
    notification: (e) => (
      <>
        Tag <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  tag_delete: {
    notification: (e) => (
      <>
        Tag {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
};
