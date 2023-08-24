import { GrantType, Grants } from '@linode/api-v4/lib/account';

import { TabInfo } from './UserPermissions';

export const globalBooleanPerms = [
  'add_linodes',
  'add_nodebalancers',
  'add_longview',
  'longview_subscription',
  'add_domains',
  'add_stackscripts',
  'add_images',
  'add_volumes',
  'add_firewalls',
  'cancel_account',
  'add_databases',
];

export const entityPerms: GrantType[] = [
  'linode',
  'volume',
  'nodebalancer',
  'firewall',
  'stackscript',
  'image',
  'domain',
  'database',
  'longview',
];

export const entityNameMap: Record<GrantType, string> = {
  database: 'Databases',
  domain: 'Domains',
  firewall: 'Firewalls',
  image: 'Images',
  linode: 'Linodes',
  longview: 'Longview Clients',
  nodebalancer: 'NodeBalancers',
  stackscript: 'StackScripts',
  volume: 'Volumes',
};

export const permDescriptionMap = {
  add_databases: 'Can add Databases to this account ($)',
  add_domains: 'Can add Domains using the DNS Manager',
  add_firewalls: 'Can add Firewalls to this account',
  add_images: 'Can create frozen Images under this account ($)',
  add_linodes: 'Can add Linodes to this account ($)',
  add_longview: 'Can add Longview clients to this account',
  add_nodebalancers: 'Can add NodeBalancers to this account ($)',
  add_stackscripts: 'Can create StackScripts under this account',
  add_volumes: 'Can add Block Storage Volumes to this account ($)',
  cancel_account: 'Can cancel the entire account',
  longview_subscription:
    'Can modify this account\u{2019}s Longview subscription ($)',
};

export const permOptions = [
  { label: 'None', value: 'null' },
  { label: 'Read Only', value: 'read_only' },
  { label: 'Read Write', value: 'read_write' },
];

export const getTabInformation = (grants: Grants) =>
  entityPerms.reduce(
    (acc: TabInfo, entity: GrantType) => {
      const grantsForEntity = grants[entity];
      if (grantsForEntity.length > 25) {
        return { showTabs: true, tabs: [...acc.tabs, entity] };
      }
      if (grantsForEntity.length > 0) {
        return { ...acc, tabs: [...acc.tabs, entity] };
      }
      return acc;
    },
    { showTabs: false, tabs: [] }
  );
