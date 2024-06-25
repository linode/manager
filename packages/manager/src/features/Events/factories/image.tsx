import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const image: PartialEventMap<'image'> = {
  image_delete: {
    failed: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Image {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Image {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  image_update: {
    notification: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  image_upload: {
    failed: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>uploaded</strong>: {e?.message?.replace(/(\d+)/g, '$1 MB')}.
      </>
    ),

    finished: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> has been{' '}
        <strong>uploaded</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> has been{' '}
        <strong>uploaded</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>upload</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventLink event={e} to="entity" /> is being{' '}
        <strong>uploaded</strong>.
      </>
    ),
  },
};
