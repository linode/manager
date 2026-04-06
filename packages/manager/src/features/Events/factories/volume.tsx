import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const volume: PartialEventMap<'volume'> = {
  volume_attach: {
    failed: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>attached</strong> to Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>attached</strong> to Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>attached</strong> to Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>attached</strong> to Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is being{' '}
        <strong>attached</strong> to Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  volume_clone: {
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>cloned</strong>.
      </>
    ),
  },
  volume_create: {
    failed: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>created</strong>.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  volume_delete: {
    failed: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Volume {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Volume {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  volume_detach: {
    failed: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>detached</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>detached</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>detached</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>detached</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is being{' '}
        <strong>detached</strong> from Linode{' '}
        <EventLink event={e} to="secondaryEntity" />.
      </>
    ),
  },
  volume_migrate: {
    failed: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
    finished: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
    started: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is being{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
  },
  volume_migrate_scheduled: {
    scheduled: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>migrated</strong> to NVMe.
      </>
    ),
  },
  volume_resize: {
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
  },
  volume_update: {
    notification: (e) => (
      <>
        Volume <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
