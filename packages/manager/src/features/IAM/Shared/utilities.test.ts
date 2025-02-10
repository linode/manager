import { getAllRoles, getRoleByName } from './utilities';

import type { IamAccountPermissions } from '@linode/api-v4';

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
