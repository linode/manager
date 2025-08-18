import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { formattedTypes } from 'src/features/Firewalls/FirewallDetail/Devices/constants';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';
import type { Event } from '@linode/api-v4';
import type { FirewallDeviceEntityType } from '@linode/api-v4';

const entityPrefix = (e: Event) => {
  const type = e?.entity?.type ? capitalize(e.entity.type) : null;

  return type ? (
    <>
      {type} <EventLink event={e} to="entity" />{' '}
    </>
  ) : null;
};

export const firewall: PartialEventMap<'firewall'> = {
  firewall_apply: {
    failed: (e) => {
      return (
        <>
          {entityPrefix(e)} Firewall update could <strong>not</strong> be{' '}
          <strong>applied</strong>.
        </>
      );
    },
    finished: (e) => {
      return (
        <>
          {entityPrefix(e)} Firewall update has been <strong>applied</strong>.
        </>
      );
    },
    scheduled: (e) => {
      return (
        <>
          {entityPrefix(e)} Firewall update is <strong>scheduled</strong>.
        </>
      );
    },
    started: (e) => {
      return (
        <>
          {entityPrefix(e)} Firewall update has <strong>started</strong>.
        </>
      );
    },
  },
  firewall_create: {
    notification: (e) => (
      <>
        Firewall <EventLink event={e} to="entity" /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  firewall_delete: {
    notification: (e) => (
      <>
        Firewall {e.entity?.label} has been <strong>deleted</strong>.
      </>
    ),
  },
  firewall_device_add: {
    notification: (e) => {
      if (e.secondary_entity?.type) {
        // TODO - Linode Interfaces [M3-10447] - clean this up when API ticket [VPC-3359] is completed
        const secondaryEntityName =
          formattedTypes[e.secondary_entity.type as FirewallDeviceEntityType] ??
          'Linode Interface';
        return (
          <>
            {secondaryEntityName} <EventLink event={e} to="secondaryEntity" />{' '}
            has been <strong>added</strong> to Firewall{' '}
            <EventLink event={e} to="entity" />.
          </>
        );
      }
      return (
        <>
          A device has been <strong>added</strong> to Firewall{' '}
          <EventLink event={e} to="entity" />.
        </>
      );
    },
  },
  firewall_device_remove: {
    notification: (e) => {
      if (e.secondary_entity?.type) {
        const secondaryEntityName =
          formattedTypes[e.secondary_entity.type as FirewallDeviceEntityType];
        return (
          <>
            {secondaryEntityName} <EventLink event={e} to="secondaryEntity" />{' '}
            has been <strong>removed</strong> from Firewall{' '}
            <EventLink event={e} to="entity" />.
          </>
        );
      }
      return (
        <>
          A device has been <strong>removed</strong> from Firewall{' '}
          <EventLink event={e} to="entity" />.
        </>
      );
    },
  },
  firewall_disable: {
    notification: (e) => (
      <>
        Firewall <EventLink event={e} to="entity" /> has been{' '}
        <strong>disabled</strong>.
      </>
    ),
  },
  firewall_enable: {
    notification: (e) => (
      <>
        Firewall <EventLink event={e} to="entity" /> has been{' '}
        <strong>enabled</strong>.
      </>
    ),
  },
  firewall_rules_update: {
    notification: (e) => (
      <>
        Firewall rules have been <strong>updated</strong> on{' '}
        <EventLink event={e} to="entity" />.
      </>
    ),
  },
  firewall_update: {
    notification: (e) => (
      <>
        Firewall <EventLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
