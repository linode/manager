import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const obj: PartialEventMap = {
  obj_access_key_create: {
    notification: (e) => (
      <>
        Access Key <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>created</strong>.
      </>
    ),
  },
  obj_access_key_delete: {
    notification: (e) => (
      <>
        Access Key <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>deleted</strong>.
      </>
    ),
  },
  obj_access_key_update: {
    notification: (e) => (
      <>
        Access Key <EventMessageLink action={e.action} entity={e.entity} /> has
        been <strong>updated</strong>.
      </>
    ),
  },
};
