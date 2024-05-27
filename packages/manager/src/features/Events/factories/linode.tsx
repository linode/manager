import * as React from 'react';

import { Link } from 'src/components/Link';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const linode: PartialEventMap = {
  linode_addip: {
    notification: (e) => (
      <>
        An IP address has been <strong>added</strong> to Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_boot: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
  },
  linode_clone: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    notification: (e) => (
      <>
        Linode {e.entity?.label} is scheduled to be <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
  },
  linode_config_create: {
    notification: (e) => (
      <>
        Config{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>created</strong> on Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_config_delete: {
    notification: (e) => (
      <>
        Config{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>deleted</strong> on Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_config_update: {
    notification: (e) => (
      <>
        Config{' '}
        <EventMessageLink action={e.action} entity={e.secondary_entity} /> has
        been <strong>updated</strong> on Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_create: {
    failed: (e) => (
      <>
        Linode {e.entity!.label} could <strong>not</strong> be{' '}
        <strong>created</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode {e.entity!.label} is scheduled for <strong>creation</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode {e.entity!.label} is being <strong>created</strong>.
      </>
    ),
  },
  linode_delete: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  linode_deleteip: {
    notification: (e) => (
      <>
        An IP address has been <strong>removed</strong> from Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_migrate: {
    failed: (e) => (
      <>
        Migration <strong>failed</strong> for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>migrated</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>migrated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>migrated</strong>.
      </>
    ),
  },
  linode_migrate_datacenter: {
    failed: (e) => (
      <>
        Migration <strong>failed</strong> for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>migrated</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>migrated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>migrated</strong>.
      </>
    ),
  },
  linode_migrate_datacenter_create: {
    notification: (e) => (
      <>
        Migration has been <strong>initiated</strong> for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_mutate: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>upgraded</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>upgraded</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>upgraded</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>upgraded</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>upgraded</strong>.
      </>
    ),
  },
  linode_mutate_create: {
    notification: (e) => (
      <>
        A <strong>resize</strong> has been initiated for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_reboot: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled to be <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config{' '}
            <EventMessageLink action={e.action} entity={e.secondary_entity} />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
  },
  linode_rebuild: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>rebuilt</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>rebuilt</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled for <strong>rebuild</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>rebuilt</strong>.
      </>
    ),
  },
  linode_resize: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} />
        has been <strong>resized</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is being{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled for <strong>resizing</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is{' '}
        <strong>resizing</strong>.
      </>
    ),
  },
  linode_resize_create: {
    notification: (e) => (
      <>
        A <strong>resize</strong> has been initiated for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_resize_warm_create: {
    notification: (e) => (
      <>
        A <strong>warm resize</strong> has been initiated for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_shutdown: {
    failed: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> could{' '}
        <strong>not</strong> be <strong>shut down</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>shut down</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled for <strong>shutdown</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is{' '}
        <strong>shutting down</strong>.
      </>
    ),
  },
  linode_snapshot: {
    failed: (e) => (
      <>
        Snapshot backup <strong>failed</strong> on Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.{' '}
        <Link to="https://www.linode.com/docs/products/storage/backups/#limits-and-considerations">
          Learn more about limits and considerations
        </Link>
      </>
    ),
    finished: (e) => (
      <>
        A snapshot backup has been created for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> is
        scheduled for a snapshot backup.
      </>
    ),
    started: (e) => (
      <>
        A snapshot backup is being created for Linode{' '}
        <EventMessageLink action={e.action} entity={e.entity} />.
      </>
    ),
  },
  linode_update: {
    notification: (e) => (
      <>
        Linode <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
