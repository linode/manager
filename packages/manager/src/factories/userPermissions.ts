import { Factory } from '@linode/utilities';

import type {
  EntityAccess,
  EntityType,
  IamUserPermissions,
  RoleType,
} from '@linode/api-v4';

const possibleRoles: RoleType[] = [
  'firewall_admin',
  'firewall_creator',
  'linode_contributor',
  'linode_creator',
  'linode_viewer',
  'update_firewall',
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

export const userPermissionsFactory =
  Factory.Sync.makeFactory<IamUserPermissions>({
    account_access: [
      'account_linode_admin',
      'linode_creator',
      'firewall_creator',
      'account_admin',
      'account_viewer',
    ],
    entity_access: entityAccessList,
  });
