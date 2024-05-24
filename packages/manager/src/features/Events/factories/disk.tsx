import * as React from 'react';

import { Link } from 'src/components/Link';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const disk: PartialEventMap = {
  disk_create: {
    failed: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> could{' '}
        <strong>not</strong> be <strong>added</strong> to Linode{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
    finished: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> has been{' '}
        <strong>added</strong> to Linode <EventMessageLink entity={e.entity} />.
      </>
    ),
    notification: () => '',
    scheduled: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> is being{' '}
        <strong>added</strong> to Linode <EventMessageLink entity={e.entity} />.
      </>
    ),
    started: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> is being{' '}
        <strong>added</strong> to <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
  disk_delete: {
    failed: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> could{' '}
        <strong> not</strong> be <strong>deleted</strong> on Linode{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
    finished: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> on Linode{' '}
        <EventMessageLink entity={e.entity} /> has been <strong>deleted</strong>
        .
      </>
    ),
    // notification: () => '',
    scheduled: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> on Linode{' '}
        <EventMessageLink entity={e.entity} /> is scheduled for deletion.
      </>
    ),
    started: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> on Linode{' '}
        <EventMessageLink entity={e.entity} /> is being deleted.
      </>
    ),
  },
  disk_duplicate: {
    failed: (e) => (
      <>
        Disk on Linode <EventMessageLink entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>duplicated</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Disk on Linode <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>duplicated</strong>.
      </>
    ),
    // notification: () => '',
    scheduled: (e) => (
      <>
        Disk on Linode <EventMessageLink entity={e.entity} /> is scheduled to be{' '}
        <strong>duplicated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Disk on Linode <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>duplicated</strong>.
      </>
    ),
  },
  disk_imagize: {
    failed: (e) => (
      <>
        Image <EventMessageLink entity={e.secondary_entity} /> could{' '}
        <strong>not</strong> be <strong>created</strong>.{' '}
        <Link to="https://www.linode.com/docs/products/tools/images/#technical-specifications">
          Learn more about image technical specifications.
        </Link>
      </>
    ),
    finished: (e) => (
      <>
        Image <EventMessageLink entity={e.secondary_entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventMessageLink entity={e.secondary_entity} /> is scheduled to
        be <strong>created</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventMessageLink entity={e.secondary_entity} /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  disk_resize: {
    failed: (e) => (
      <>
        A disk on Linode <EventMessageLink entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>resized</strong>.{' '}
        <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/">
          Learn more
        </Link>
      </>
    ),

    finished: (e) => (
      <>
        A disk on Linode <EventMessageLink entity={e.entity} /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        A disk on Linode <EventMessageLink entity={e.entity} /> is scheduled to
        be <strong>resized</strong>.
      </>
    ),
    started: (e) => (
      <>
        A disk on Linode <EventMessageLink entity={e.entity} /> is being{' '}
        <strong>resized</strong>.
      </>
    ),
    // notification: e => '',
  },
  disk_update: {
    notification: (e) => (
      <>
        Disk <EventMessageLink entity={e.secondary_entity} /> has been{' '}
        <strong>updated</strong> on Linode{' '}
        <EventMessageLink entity={e.entity} />.
      </>
    ),
  },
};
