import * as React from 'react';

import { Link } from 'src/components/Link';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';

export const disk: PartialEventMap = {
  disk_create: {
    failed: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> could{' '}
        <strong>not</strong> be <strong>added</strong> to Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>added</strong> to Linode <EventLink event={e} to="entity" />.
      </>
    ),
    notification: () => '',
    scheduled: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> is being{' '}
        <strong>added</strong> to Linode <EventLink event={e} to="entity" />.
      </>
    ),
    started: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> is being{' '}
        <strong>added</strong> to <EventLink event={e} to="entity" />.
      </>
    ),
  },
  disk_delete: {
    failed: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> could{' '}
        <strong> not</strong> be <strong>deleted</strong> on Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Disk {e.secondary_entity?.label} on Linode{' '}
        <EventLink event={e} to="entity" /> has been <strong>deleted</strong>.
      </>
    ),
    // notification: () => '',
    scheduled: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> on Linode{' '}
        <EventLink event={e} to="entity" /> is scheduled for deletion.
      </>
    ),
    started: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> on Linode{' '}
        <EventLink event={e} to="entity" /> is being deleted.
      </>
    ),
  },
  disk_duplicate: {
    failed: (e) => (
      <>
        Disk on Linode <EventLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>duplicated</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Disk on Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>duplicated</strong>.
      </>
    ),
    // notification: () => '',
    scheduled: (e) => (
      <>
        Disk on Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>duplicated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Disk on Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>duplicated</strong>.
      </>
    ),
  },
  disk_imagize: {
    failed: (e) => (
      <>
        Image <EventLink event={e} to="secondaryEntity" /> could{' '}
        <strong>not</strong> be <strong>created</strong>.{' '}
        <Link to="https://www.linode.com/docs/products/tools/images/#technical-specifications">
          Learn more about image technical specifications.
        </Link>
      </>
    ),
    finished: (e) => (
      <>
        Image <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Image <EventLink event={e} to="secondaryEntity" /> is scheduled to be{' '}
        <strong>created</strong>.
      </>
    ),
    started: (e) => (
      <>
        Image <EventLink event={e} to="secondaryEntity" /> is being{' '}
        <strong>created</strong>.
      </>
    ),
  },
  disk_resize: {
    failed: (e) => (
      <>
        A disk on Linode <EventLink event={e} to="entity" /> could{' '}
        <strong>not</strong> be <strong>resized</strong>.{' '}
        <Link to="https://www.linode.com/docs/products/compute/compute-instances/guides/disks-and-storage/">
          Learn more
        </Link>
      </>
    ),

    finished: (e) => (
      <>
        A disk on Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        A disk on Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>resized</strong>.
      </>
    ),
    started: (e) => (
      <>
        A disk on Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>resized</strong>.
      </>
    ),
    // notification: e => '',
  },
  disk_update: {
    notification: (e) => (
      <>
        Disk <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>updated</strong> on Linode <EventLink event={e} to="entity" />.
      </>
    ),
  },
};
