import { grantFactory, grantsFactory } from '@linode/utilities';
import { randomLabel } from 'support/util/random';

import type { Grants } from '@linode/api-v4';

/**
 * User permission grants with all permissions restricted.
 */
export const userPermissionsGrants: Grants = grantsFactory.build({
  global: {
    account_access: null,
    cancel_account: false,
    child_account_access: false,
    add_domains: false,
    add_firewalls: false,
    add_images: false,
    add_linodes: false,
    add_longview: false,
    add_nodebalancers: false,
    add_stackscripts: false,
    add_databases: false,
    add_volumes: false,
    add_vpcs: false,
    longview_subscription: false,
  },
  database: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  domain: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  firewall: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  image: grantFactory.buildList(1, { label: randomLabel(), permissions: null }),
  linode: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  longview: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  nodebalancer: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  stackscript: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  volume: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  vpc: grantFactory.buildList(1, { label: randomLabel(), permissions: null }),
});
