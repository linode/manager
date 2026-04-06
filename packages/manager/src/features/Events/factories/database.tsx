import * as React from 'react';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const database: PartialEventMap<'database'> = {
  database_backup_create: {
    notification: (e) => (
      <>
        Database backup <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  database_backup_delete: {
    notification: (e) => (
      <>
        Database backup {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  database_backup_restore: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>restored</strong> from a backup.
      </>
    ),
  },
  database_create: {
    failed: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
        be <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>creation</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  database_credentials_reset: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> credentials have been{' '}
        <strong>reset</strong>.
      </>
    ),
  },
  database_degraded: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>degraded</strong>.
      </>
    ),
  },
  database_delete: {
    notification: (e) => (
      <>
        Database {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  database_failed: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
        be <strong>updated</strong>.
      </>
    ),
  },
  database_low_disk_space: {
    finished: (e) => (
      <>
        Low disk space alert for database <EventLink event={e} to="entity" />{' '}
        has <strong>cleared</strong>.
      </>
    ),

    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has{' '}
        <strong>low disk space</strong>.
      </>
    ),
  },
  database_migrate: {
    finished: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> migration{' '}
        <strong>completed</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> migration{' '}
        <strong>in progress</strong>.
      </>
    ),
  },
  database_resize: {
    failed: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
        be <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>resizing</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is{' '}
        <strong>resizing</strong>.
      </>
    ),
  },
  database_resize_create: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> scheduled to be{' '}
        <strong>resized</strong>.
      </>
    ),
  },
  database_scale: {
    failed: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
        be <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>resizing</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> is{' '}
        <strong>resizing</strong>.
      </>
    ),
  },
  database_update: {
    finished: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  database_update_failed: {
    notification: (e) => (
      <>
        Database <EventLink event={e} to="entity" /> could <strong>not</strong>{' '}
        be <strong>updated</strong>.
      </>
    ),
  },
  database_upgrade: {
    notification: (e) => (
      <>
        Database {e.entity?.label} has been <strong>upgraded</strong>.
      </>
    ),
  },
};
