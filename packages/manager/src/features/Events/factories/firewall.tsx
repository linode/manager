import { capitalize } from '@linode/utilities';
import * as React from 'react';

import { formattedTypes } from 'src/features/Firewalls/FirewallDetail/Devices/constants';

import { EventLink } from '../EventLink';

import type { PartialEventMap } from '../types';
import type { FirewallDeviceEntityType } from '@linode/api-v4';

export const firewall: PartialEventMap<'firewall'> = {
  firewall_apply: {
    failed: (e) => {
      const entityType = capitalize(e.entity?.type ?? '');
      return (
        <>
          A firewall change could not be <strong>applied</strong> to{' '}
          {entityType} <EventLink event={e} to="entity" />.
        </>
      );
    },
    finished: (e) => {
      const entityType = capitalize(e.entity?.type ?? '');
      return (
        <>
          A firewall change has been <strong>applied</strong> to {entityType}{' '}
          <EventLink event={e} to="entity" />.
        </>
      );
    },
    scheduled: (e) => {
      const entityType = capitalize(e.entity?.type ?? '');
      return (
        <>
          A firewall change is scheduled to be <strong>applied</strong> to
          {entityType} <EventLink event={e} to="entity" />.
        </>
      );
    },
    started: (e) => {
      const entityType = capitalize(e.entity?.type ?? '');
      return (
        <>
          A firewall change has <strong>started</strong> for {entityType}{' '}
          <EventLink event={e} to="entity" />.
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
