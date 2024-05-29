import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const ticket: PartialEventMap = {
  ticket_attachment_upload: {
    notification: (e) => (
      <>
        File has been successfully <strong>uploaded</strong> to support ticket
        &quot;
        <EventMessageLink event={e} to="entity" />
        &quot;.
      </>
    ),
  },
  // ticket_reply: {
  //   scheduled: e => ``,
  //   started: e => ``,
  //   failed: e => ``,
  //   finished: e => ``,
  //   notification: e => ``,
  // },
  ticket_create: {
    notification: (e) => (
      <>
        New support ticket &quot;
        <EventMessageLink event={e} to="entity" />
        &quot; has been <strong>created</strong>.
      </>
    ),
  },
  ticket_update: {
    notification: (e) => (
      <>
        Support ticket &quot;
        <EventMessageLink event={e} to="entity" />
        &quot; has been <strong>updated</strong>.
      </>
    ),
  },
};
