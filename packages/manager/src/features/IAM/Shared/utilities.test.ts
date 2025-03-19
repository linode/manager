import {
  combineRoles,
  getAllRoles,
  getRoleByName,
  mapRolesToPermissions,
} from './utilities';

import type { CombinedRoles } from './utilities';
import type { IamAccountPermissions, IamUserPermissions } from '@linode/api-v4';

const accountPermissions: IamAccountPermissions = {
  account_access: [
    {
      resource_type: 'account',
      roles: [
        {
          description:
            'Access to perform any supported action on all resources in the account',
          name: 'account_admin',
          permissions: ['create_linode', 'update_linode', 'update_firewall'],
        },
      ],
    },
    {
      resource_type: 'linode',
      roles: [
        {
          description:
            'Access to perform any supported action on all linode instances in the account',
          name: 'account_linode_admin',
          permissions: ['create_linode', 'update_linode', 'delete_linode'],
        },
      ],
    },
  ],
  resource_access: [
    {
      resource_type: 'linode',
      roles: [
        {
          description: 'Access to update a linode instance',
          name: 'linode_contributor',
          permissions: ['update_linode', 'view_linode'],
        },
      ],
    },
  ],
};

const userPermissions: IamUserPermissions = {
  account_access: ['account_linode_admin', 'linode_creator'],
  resource_access: [
    {
      resource_id: 12345678,
      resource_type: 'linode',
      roles: ['linode_contributor'],
    },
  ],
};

describe('getAllRoles', () => {
  it('should return a list of roles for each access type', () => {
    const expectedRoles = [
      { label: 'account_admin', value: 'account_admin' },
      { label: 'account_linode_admin', value: 'account_linode_admin' },
      { label: 'linode_contributor', value: 'linode_contributor' },
    ];

    expect(getAllRoles(accountPermissions)).toEqual(expectedRoles);
  });
});

describe('getRoleByName', () => {
  it('should return an object with details about this role account_access', () => {
    const roleName = 'account_admin';
    const expectedRole = {
      access: 'account_access',
      description:
        'Access to perform any supported action on all resources in the account',
      name: 'account_admin',
      permissions: ['create_linode', 'update_linode', 'update_firewall'],
      resource_type: 'account',
    };

    expect(getRoleByName(accountPermissions, roleName)).toEqual(expectedRole);
  });

  it('should return an object with details about this role resource_access', () => {
    const roleName = 'linode_contributor';
    const expectedRole = {
      access: 'resource_access',
      description: 'Access to update a linode instance',
      name: 'linode_contributor',
      permissions: ['update_linode', 'view_linode'],
      resource_type: 'linode',
    };

    expect(getRoleByName(accountPermissions, roleName)).toEqual(expectedRole);
  });
});

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
      { id: null, name: 'account_admin' },
      { id: null, name: 'account_linode_admin' },
      { id: [12345678], name: 'linode_contributor' },
    ];

    const expectedRoles = [
      {
        access: 'account',
        description:
          'Access to perform any supported action on all resources in the account',
        id: 'account_admin',
        name: 'account_admin',
        permissions: ['create_linode', 'update_linode', 'update_firewall'],
        resource_ids: null,
        resource_type: 'account',
      },
      {
        access: 'account',
        description:
          'Access to perform any supported action on all linode instances in the account',
        id: 'account_linode_admin',
        name: 'account_linode_admin',
        permissions: ['create_linode', 'update_linode', 'delete_linode'],
        resource_ids: null,
        resource_type: 'linode',
      },
      {
        access: 'resource',
        description: 'Access to update a linode instance',
        id: 'linode_contributor',
        name: 'linode_contributor',
        permissions: ['update_linode', 'view_linode'],
        resource_ids: [12345678],
        resource_type: 'linode',
      },
    ];

    expect(mapRolesToPermissions(accountPermissions, userRoles)).toEqual(
      expectedRoles
    );
  });
});
