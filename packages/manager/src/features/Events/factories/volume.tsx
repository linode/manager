import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const volume: PartialEventMap = {
  volume_attach: {
    failed: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>attached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>attached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>attached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>attached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is being{' '}
        <strong>attached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  volume_clone: {
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>cloned</strong>.
      </>
    ),
  },
  volume_create: {
    failed: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>created</strong>.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  volume_delete: {
    failed: (e) => ``,
    finished: (e) => ``,
    notification: (e) => (
      <>
        Volume {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => ``,
    started: (e) => ``,
  },
  volume_detach: {
    failed: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>detached</strong> to Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>detached</strong> from Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>detached</strong> from Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>detached</strong> from Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is being{' '}
        <strong>detached</strong> from Linode{' '}
        <EventMessageLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  volume_migrate: {
    failed: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>migrated</strong> to NVMe.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is being{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
  },
  volume_migrate_scheduled: {
    scheduled: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
  },
  volume_resize: {
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
  },
  volume_update: {
    notification: (e) => (
      <>
        Volume <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
