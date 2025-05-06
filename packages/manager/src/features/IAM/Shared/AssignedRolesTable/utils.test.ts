import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';

import {
  addEntitiesNamesToRoles,
  combineRoles,
  mapRolesToPermissions,
} from './utils';

import type { ExtendedRoleView } from '../types';
import type { CombinedRoles } from './utils';
import type { AccountEntity, EntityType } from '@linode/api-v4';

const userPermissions = userPermissionsFactory.build({
  account_access: ['account_linode_admin', 'linode_creator'],
  entity_access: [
    {
      id: 12345678,
      roles: ['linode_contributor'],
      type: 'linode',
    },
  ],
});

const accountAccess = 'account_access';
const entityAccess = 'entity_access';

const accountPermissions = accountPermissionsFactory.build();
describe('combineRoles', () => {
  it('should return an object of users roles', () => {
    const expectedRoles = [
      { id: null, name: 'account_linode_admin' },
      { id: null, name: 'linode_creator' },
      { id: [12345678], name: 'linode_contributor' },
    ];

    expect(combineRoles(userPermissions)).toEqual(expectedRoles);
  });
});

describe('mapRolesToPermissions', () => {
  it('should return an object of users roles', () => {
    const userRoles: CombinedRoles[] = [
      { id: null, name: 'firewall_creator' },
      { id: [12345678], name: 'image_viewer' },
    ];

    const expectedRoles = [
      {
        access: accountAccess,
        description: 'Access to create a firewall instance',
        entity_ids: null,
        entity_type: 'firewall',
        id: 'firewall_creator',
        name: 'firewall_creator',
        permissions: ['create_firewall', 'list_firewalls'],
      },
      {
        access: entityAccess,
        description: 'Access to view a image instance',
        entity_ids: [12345678],
        entity_type: 'image',
        id: 'image_viewer',
        name: 'image_viewer',
        permissions: ['view_image'],
      },
    ];

    expect(mapRolesToPermissions(accountPermissions, userRoles)).toEqual(
      expectedRoles
    );
  });
});

describe('addResourceNamesToRoles', () => {
  it('should return an object of users roles', () => {
    const mockGoupedEntities: Map<
      EntityType,
      Pick<AccountEntity, 'id' | 'label'>[]
    > = new Map([
      [
        'linode',
        [
          { id: 12345678, label: 'linode-1' },
          { id: 2, label: 'test 2' },
        ],
      ],
    ]);
    const userRoles: ExtendedRoleView[] = [
      {
        access: accountAccess,
        description:
          'Access to perform any supported action on all resources in the account',
        id: 'account_admin',
        name: 'account_admin',
        permissions: ['create_linode', 'update_linode', 'update_firewall'],
        entity_ids: null,
        entity_type: 'account',
      },
      {
        access: entityAccess,
        description: 'Access to update a linode instance',
        id: 'linode_contributor',
        name: 'linode_contributor',
        permissions: ['update_linode', 'view_linode'],
        entity_ids: [12345678],
        entity_type: 'linode',
      },
    ];

    const expectedRoles = [
      {
        access: accountAccess,
        description:
          'Access to perform any supported action on all resources in the account',
        id: 'account_admin',
        name: 'account_admin',
        permissions: ['create_linode', 'update_linode', 'update_firewall'],
        entity_ids: null,
        entity_names: [],
        entity_type: 'account',
      },
      {
        access: entityAccess,
        description: 'Access to update a linode instance',
        id: 'linode_contributor',
        name: 'linode_contributor',
        permissions: ['update_linode', 'view_linode'],
        entity_ids: [12345678],
        entity_names: ['linode-1'],
        entity_type: 'linode',
      },
    ];

    expect(addEntitiesNamesToRoles(userRoles, mockGoupedEntities)).toEqual(
      expectedRoles
    );
  });
});
