import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const ticket: PartialEventMap<'ticket'> = {
  ticket_attachment_upload: {
    notification: (e) => (
      <>
        File has been successfully <strong>uploaded</strong> to support ticket
        &quot;
        <EventLink event={e} to="entity" />
        &quot;.
      </>
    ),
  },
  ticket_create: {
    notification: (e) => (
      <>
        New support ticket &quot;
        <EventLink event={e} to="entity" />
        &quot; has been <strong>created</strong>.
      </>
    ),
  },
  ticket_update: {
    notification: (e) => (
      <>
        Support ticket &quot;
        <EventLink event={e} to="entity" />
        &quot; has been <strong>updated</strong>.
      </>
    ),
  },
};
