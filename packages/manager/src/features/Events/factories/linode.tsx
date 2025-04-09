import { useLinodeQuery } from '@linode/queries';
import { formatStorageUnits } from '@linode/utilities';
import * as React from 'react';

import { Link } from 'src/components/Link';
import { useTypeQuery } from 'src/queries/types';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';
import type { Event } from '@linode/api-v4';

export const linode: PartialEventMap<'linode'> = {
  linode_addip: {
    notification: (e) => (
      <>
        An IP address has been <strong>added</strong> to Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_boot: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>booted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
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
        Linode {e.entity?.label} could <strong>not</strong> be{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>cloned</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            to <EventLink event={e} to="secondaryEntity" />
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
        Config <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>created</strong> on Linode <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_config_delete: {
    notification: (e) => (
      <>
        Config {e.secondary_entity?.label} has been <strong>deleted</strong> on
        Linode <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_config_update: {
    notification: (e) => (
      <>
        Config <EventLink event={e} to="secondaryEntity" /> has been{' '}
        <strong>updated</strong> on Linode <EventLink event={e} to="entity" />.
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
        Linode <EventLink event={e} to="entity" /> has been{' '}
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
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>deleted</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>deleted</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  linode_deleteip: {
    notification: (e) => (
      <>
        An IP address has been <strong>removed</strong> from Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_migrate: {
    failed: (e) => (
      <>
        Migration <strong>failed</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>migrated</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>migrated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>migrated</strong>.
      </>
    ),
  },
  linode_migrate_datacenter: {
    failed: (e) => (
      <>
        Migration <strong>failed</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>migrated</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>migrated</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>migrated</strong> to a new region.
      </>
    ),
  },
  linode_migrate_datacenter_create: {
    notification: (e) => (
      <>
        Migration has been <strong>initiated</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  // TODO Host & VM Maintenance: copy is not final
  linode_migration: {
    failed: (e) => (
      <>
        {e.description ?? 'Maintenance'} <strong>migration failed</strong> for
        Linode <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> <strong>migration</strong>{' '}
        {e.description?.toLowerCase() ?? 'maintenance'} completed.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has scheduled{' '}
        <strong>migration</strong>{' '}
        {e.description?.toLowerCase() ?? 'maintenance'}.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>migrated</strong> for{' '}
        {e.description?.toLowerCase() ?? 'maintenance'}.
      </>
    ),
  },
  linode_mutate: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>upgraded</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>upgraded</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>upgraded</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>upgraded</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>upgraded</strong>.
      </>
    ),
  },
  linode_mutate_create: {
    notification: (e) => (
      <>
        A <strong>resize</strong> has been initiated for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  // TODO Host & VM Maintenance: copy is not final
  linode_power_on_off: {
    failed: (e) => (
      <>
        {e.description ?? 'Maintenance'}{' '}
        <strong>power-on/power-off failed</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" />{' '}
        <strong>power-on/power-off</strong>{' '}
        {e.description?.toLowerCase() ?? 'maintenance'} completed.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has scheduled{' '}
        <strong>power-on/power-off</strong>{' '}
        {e.description?.toLowerCase() ?? 'maintenance'}.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>powered-on/powered-off</strong> for{' '}
        {e.description?.toLowerCase() ?? 'maintenance'}.
      </>
    ),
  },
  linode_reboot: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled to be{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
          </>
        ) : (
          ''
        )}
        .
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>rebooted</strong>
        {e.secondary_entity ? (
          <>
            {' '}
            with config <EventLink event={e} to="secondaryEntity" />
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
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>rebuilt</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>rebuilt</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>rebuild</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>rebuilt</strong>.
      </>
    ),
  },
  linode_resize: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>resized</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>resized</strong>.
      </>
    ),
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is being{' '}
        <strong>resized</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>resizing</strong>.
      </>
    ),
    started: (e) => <LinodeResizeStartedMessage event={e} />,
  },
  linode_resize_create: {
    notification: (e) => (
      <>
        A <strong>resize</strong> has been initiated for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_resize_warm_create: {
    notification: (e) => (
      <>
        A <strong>warm resize</strong> has been initiated for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_shutdown: {
    failed: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> could <strong>not</strong> be{' '}
        <strong>shut down</strong>.
      </>
    ),
    finished: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>shut down</strong>.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled for{' '}
        <strong>shutdown</strong>.
      </>
    ),
    started: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is{' '}
        <strong>shutting down</strong>.
      </>
    ),
  },
  linode_snapshot: {
    failed: (e) => (
      <>
        Snapshot backup <strong>failed</strong> on Linode{' '}
        <EventLink event={e} to="entity" />.{' '}
        <Link to="https://techdocs.akamai.com/cloud-computing/docs/backup-service#limits-and-considerations">
          Learn more about limits and considerations
        </Link>
        .
      </>
    ),
    finished: (e) => (
      <>
        A snapshot backup has been <strong>created</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
    scheduled: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> is scheduled for a snapshot
        <strong>backup</strong>.
      </>
    ),
    started: (e) => (
      <>
        A snapshot backup is being <strong>created</strong> for Linode{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  linode_update: {
    notification: (e) => (
      <>
        Linode <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};

const LinodeResizeStartedMessage = ({ event }: { event: Event }) => {
  const { data: linode } = useLinodeQuery(event.entity?.id ?? -1);
  const type = useTypeQuery(linode?.type ?? '');

  return (
    <>
      Linode <EventLink event={event} to="entity" /> is{' '}
      <strong>resizing</strong>
      {type && (
        <>
          {' '}
          to the{' '}
          {type.data?.label && (
            <strong>{formatStorageUnits(type.data.label)}</strong>
          )}{' '}
          Plan
        </>
      )}
      .
    </>
  );
};
