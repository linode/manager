import * as React from 'react';

import { Link } from 'src/components/Link';

import type { PartialEventMap } from '../types';

export const backup: PartialEventMap<'backups'> = {
  backups_cancel: {
    notification: (e) => (
      <>
        Backups have been <strong>canceled</strong> for {e.entity!.label}.
      </>
    ),
  },
  backups_enable: {
    notification: (e) => (
      <>
        Backups have been <strong>enabled</strong> for {e.entity!.label}.
      </>
    ),
  },
  backups_restore: {
    failed: (e) => (
      <>
        Backup could <strong>not</strong> be <strong>restored</strong> for{' '}
        {e.entity!.label}.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/backup-service#limits-and-considerations">
          Learn more about limits and considerations
        </Link>
        .
      </>
    ),
    finished: (e) => (
      <>
        Backup restoration <strong>completed</strong> for {e.entity!.label}.
      </>
    ),
    notification: (e) => (
      <>
        Backup restoration <strong>completed</strong> for {e.entity!.label}.
      </>
    ),
    scheduled: (e) => (
      <>
        Backup restoration <strong>scheduled</strong> for {e.entity!.label}.
      </>
    ),
    started: (e) => (
      <>
        Backup restoration <strong>started</strong> for {e.entity!.label}.
      </>
    ),
  },
};
