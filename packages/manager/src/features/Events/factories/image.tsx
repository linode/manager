import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const image: PartialEventMap = {
  image_delete: {
    failed: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> could <strong>not</strong>{' '}
        be <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> is scheduled to be{' '}
        <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  image_update: {
    notification: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  image_upload: {
    failed: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> could <strong>not</strong>{' '}
        be <strong>uploaded</strong>: {e?.message?.replace(/(\d+)/g, '$1 MB')}.
      </>
    ),

    finished: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>uploaded</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>uploaded</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> is scheduled for{' '}
        <strong>upload</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>uploaded</strong>.
      </>
    ),
  },
};
