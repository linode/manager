import { Factory } from '@linode/utilities';

import type {
  EntityAccess,
  EntityRoleType,
  EntityType,
  IamUserRoles,
} from '@linode/api-v4';

const possibleRoles: EntityRoleType[] = [
  'firewall_admin',
  'firewall_contributor',
  'firewall_viewer',
  'linode_admin',
  'linode_contributor',
  'linode_viewer',
];

export const possibleTypes: EntityType[] = [
  'database',
  'domain',
  'firewall',
  'image',
  'linode',
  'longview',
  'nodebalancer',
  'stackscript',
  'volume',
  'vpc',
];

export const entityAccessFactory = Factory.Sync.makeFactory<EntityAccess>({
  id: Factory.each((i) => i + 1),
  roles: Factory.each((i) => [possibleRoles[i % possibleRoles.length]]),
  type: Factory.each((i) => possibleTypes[i % possibleTypes.length]),
});

const entityAccessList = [
  ...entityAccessFactory.buildList(7, {
    roles: ['linode_contributor'],
    type: 'linode',
  }),
  entityAccessFactory.build({
    id: 10,
    roles: ['linode_contributor', 'linode_viewer'],
    type: 'linode',
  }),
  entityAccessFactory.build({
    id: 1,
    roles: ['firewall_admin'],
    type: 'firewall',
  }),
];

export const userRolesFactory = Factory.Sync.makeFactory<IamUserRoles>({
  account_access: [
    'account_linode_admin',
    'account_linode_creator',
    'account_firewall_creator',
    'account_admin',
    'account_viewer',
  ],
  entity_access: entityAccessList,
});

export const userDefaultRolesFactory = Factory.Sync.makeFactory<IamUserRoles>({
  account_access: [
    'account_event_viewer',
    'account_maintenance_viewer',
    'account_notification_viewer',
    'account_oauth_client_admin',
  ],
  entity_access: [],
});
