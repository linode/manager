import { Grant, Grants } from '@linode/api-v4/lib/account';
import * as Factory from 'factory.ts';

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
    add_domains: true,
    add_firewalls: true,
    add_images: true,
    add_linodes: true,
    add_longview: true,
    add_nodebalancers: true,
    add_stackscripts: true,
    add_volumes: true,
    cancel_account: false,
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
});
