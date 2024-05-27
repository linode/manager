import * as React from 'react';

import { EventMessageLink } from '../EventMessageLink';

import type { PartialEventMap } from '../types';

export const nodeBalancer: PartialEventMap = {
  nodebalancer_config_create: {
    notification: (e) => (
      <>
        A config on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  nodebalancer_config_delete: {
    notification: (e) => (
      <>
        A config on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  nodebalancer_config_update: {
    notification: (e) => (
      <>
        A config on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  nodebalancer_create: {
    notification: (e) => (
      <>
        NodeBalancer <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>created</strong>.
      </>
    ),
  },
  nodebalancer_delete: {
    notification: (e) => (
      <>
        NodeBalancer <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>deleted</strong>.
      </>
    ),
  },
  nodebalancer_node_create: {
    notification: (e) => (
      <>
        A node on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>created</strong>.
      </>
    ),
  },
  nodebalancer_node_delete: {
    notification: (e) => (
      <>
        A node on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>deleted</strong>.
      </>
    ),
  },
  nodebalancer_node_update: {
    notification: (e) => (
      <>
        A node on NodeBalancer{' '}
        <EventMessageLink action={e.action} entity={e.entity} /> has been{' '}
        <strong>updated</strong>.
      </>
    ),
  },
  nodebalancer_update: {
    notification: (e) => (
      <>
        NodeBalancer <EventMessageLink action={e.action} entity={e.entity} />{' '}
        has been <strong>updated</strong>.
      </>
    ),
  },
};
