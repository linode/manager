import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const tag: PartialEventMap = {
  tag_create: {
    notification: (e) => (
      <>
        Tag <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  tag_delete: {
    notification: (e) => (
      <>
        Tag <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
};
