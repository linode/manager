import { Factory } from './factoryProxy';

import type { Grant, Grants } from '@linode/api-v4';

export const grantFactory = Factory.Sync.makeFactory<Grant>({
  id: Factory.each((i) => i),
  label: Factory.each((i) => `entity-${i}`),
  permissions: null,
});

export const grantsFactory = Factory.Sync.makeFactory<Grants>({
  database: [
    {
      id: 0,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  domain: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  firewall: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  global: {
    account_access: 'read_write',
    add_buckets: true,
    add_databases: true,
    add_domains: true,
    add_firewalls: true,
    add_images: true,
    add_linodes: true,
    add_lkes: true,
    add_longview: true,
    add_nodebalancers: true,
    add_kubernetes: true,
    add_stackscripts: true,
    add_volumes: true,
    add_vpcs: true,
    cancel_account: false,
    child_account_access: false,
    longview_subscription: true,
  },
  image: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  linode: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  lkecluster: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  longview: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  nodebalancer: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  stackscript: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  volume: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  vpc: [
    {
      id: 123,
      label: 'example-entity1',
      permissions: 'read_only',
    },
    {
      id: 124,
      label: 'example-entity2',
      permissions: 'read_write',
    },
    {
      id: 125,
      label: 'example-entity3',
      permissions: null,
    },
  ],
});
