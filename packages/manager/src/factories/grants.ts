import * as Factory from 'factory.ts';
import { Grants } from '@linode/api-v4/lib/account';

export const grantsFactory = Factory.Sync.makeFactory<Grants>({
  domain: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
  global: {
    account_access: 'read_only',
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
  firewall: [
    {
      id: 123,
      label: 'example-entity',
      permissions: 'read_only',
    },
  ],
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
