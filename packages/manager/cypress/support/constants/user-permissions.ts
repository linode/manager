import { grantFactory, grantsFactory } from '@linode/utilities';
import { randomLabel } from 'support/util/random';

import type { Grants } from '@linode/api-v4';

/**
 * User permission grants with all permissions restricted.
 */
export const userPermissionsGrants: Grants = grantsFactory.build({
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
  global: {
    account_access: null,
    add_databases: false,
    add_domains: false,
    add_firewalls: false,
    add_images: false,
    add_linodes: false,
    add_lkes: false,
    add_longview: false,
    add_nodebalancers: false,
    add_stackscripts: false,
    add_volumes: false,
    add_vpcs: false,
    cancel_account: false,
    child_account_access: false,
    longview_subscription: false,
  },
  image: grantFactory.buildList(1, { label: randomLabel(), permissions: null }),
  linode: grantFactory.buildList(1, {
    label: randomLabel(),
    permissions: null,
  }),
  lkecluster: grantFactory.buildList(1, {
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
