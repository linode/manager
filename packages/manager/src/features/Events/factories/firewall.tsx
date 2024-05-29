import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';
import type { FirewallDeviceEntityType } from '@linode/api-v4';

const secondaryFirewallEntityNameMap: Record<
  FirewallDeviceEntityType,
  string
> = {
  linode: 'Linode',
  nodebalancer: 'NodeBalancer',
};

export const firewall: PartialEventMap = {
  firewall_create: {
    notification: (e) => (
      <>
        Firewall <EventMessageLink event={e} to="entity" /> has been{' '}
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
          secondaryFirewallEntityNameMap[e.secondary_entity.type];
        return (
          <>
            {secondaryEntityName}{' '}
            <EventMessageLink event={e} to="secondaryEntity" /> has been{' '}
            <strong>added</strong> to Firewall{' '}
            <EventMessageLink event={e} to="entity" />.
          </>
        );
      }
      return (
        <>
          A device has been <strong>added</strong> to Firewall{' '}
          <EventMessageLink event={e} to="entity" />.
        </>
      );
    },
  },
  firewall_device_remove: {
    notification: (e) => {
      if (e.secondary_entity?.type) {
        const secondaryEntityName =
          secondaryFirewallEntityNameMap[e.secondary_entity.type];
        return (
          <>
            {secondaryEntityName}{' '}
            <EventMessageLink event={e} to="secondaryEntity" /> has been{' '}
            <strong>removed</strong> from Firewall{' '}
            <EventMessageLink event={e} to="entity" />.
          </>
        );
      }
      return (
        <>
          A device has been <strong>removed</strong> from Firewall{' '}
          <EventMessageLink event={e} to="entity" />.
        </>
      );
    },
  },
  firewall_disable: {
    notification: (e) => (
      <>
        Firewall <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>disabled</strong>.
      </>
    ),
  },
  firewall_enable: {
    notification: (e) => (
      <>
        Firewall <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>enabled</strong>.
      </>
    ),
  },
  firewall_rules_update: {
    notification: (e) => (
      <>
        Firewall rules have been <strong>updated</strong> on{' '}
        <EventMessageLink event={e} to="entity" />.
      </>
    ),
  },
  firewall_update: {
    notification: (e) => (
      <>
        Firewall <EventMessageLink event={e} to="entity" /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
};
