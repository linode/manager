import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const longview: PartialEventMap = {
  longviewclient_create: {
    notification: (e) => (
      <>
        Longview Client <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>created</strong>.
      </>
    ),
  },
  longviewclient_delete: {
    notification: (e) => (
      <>
        Longview Client <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>deleted</strong>.
      </>
    ),
  },
  longviewclient_update: {
    notification: (e) => (
      <>
        Longview Client <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>updated</strong>.
      </>
    ),
  },
};
