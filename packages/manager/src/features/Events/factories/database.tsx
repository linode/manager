import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const database: PartialEventMap = {
  database_backup_restore: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>restored</strong> from a backup.
      </>
    ),
  },
  database_create: {
    failed: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> could not be{' '}
        <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is scheduled for{' '}
        <strong>creation</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  database_credentials_reset: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> credentials have been{' '}
        <strong>reset</strong>.
      </>
    ),
  },
  database_degraded: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>degraded</strong>.
      </>
    ),
  },
  database_delete: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  database_failed: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> failed to{' '}
        <strong>update</strong>.
      </>
    ),
  },
  database_low_disk_space: {
    finished: (e) => (
      <>
        Low disk space alert for database <EventMessageLink entity={e.entity} />{' '}
        has <strong>cleared</strong>.
      </>
    ),

    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has{' '}
        <strong>low disk space</strong>.
      </>
    ),
  },
  database_resize: {
    failed: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> could not be{' '}
        <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is scheduled for{' '}
        <strong>resizing</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is{' '}
        <strong>resizing</strong>.
      </>
    ),
  },
  database_resize_create: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> scheduled to be{' '}
        <strong>resized</strong>.
      </>
    ),
  },
  database_scale: {
    failed: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> could not be{' '}
        <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is scheduled for{' '}
        <strong>resizing</strong>.
      </>
    ),
    started: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> is{' '}
        <strong>resizing</strong>.
      </>
    ),
  },
  database_update: {
    finished: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  database_update_failed: {
    notification: (e) => (
      <>
        Database <EventMessageLink entity={e.entity} /> failed to{' '}
        <strong>update</strong>.
      </>
    ),
  },
};
