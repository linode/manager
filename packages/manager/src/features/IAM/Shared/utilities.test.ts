import { userPermissionsFactory } from 'src/factories/userPermissions';

import {
  changeRoleForEntity,
  combineRoles,
  deleteUserRole,
  getAllRoles,
  getRoleByName,
  mapRolesToPermissions,
  toEntityAccess,
  updateUserRoles,
} from './utilities';

import type { CombinedRoles } from './utilities';
import type { EntityAccess, IamAccountPermissions, IamUserPermissions } from '@linode/api-v4';

const accountAccess = 'account_access';
const entityAccess = 'entity_access';

const accountPermissions: IamAccountPermissions = {
  account_access: [
    {
      roles: [
        {
          description:
            'Access to perform any supported action on all resources in the account',
          name: 'account_admin',
          permissions: ['create_linode', 'update_linode', 'update_firewall'],
        },
      ],
      type: 'account',
    },
    {
      roles: [
        {
          description:
            'Access to perform any supported action on all linode instances in the account',
          name: 'account_linode_admin',
          permissions: ['create_linode', 'update_linode', 'delete_linode'],
        },
      ],
      type: 'linode',
    },
  ],
  entity_access: [
    {
      roles: [
        {
          description: 'Access to update a linode instance',
          name: 'linode_contributor',
          permissions: ['update_linode', 'view_linode'],
        },
      ],
      type: 'linode',
    },
  ],
};

const userPermissions: IamUserPermissions = {
  account_access: ['account_linode_admin', 'linode_creator'],
  entity_access: [
    {
      id: 12345678,
      roles: ['linode_contributor'],
      type: 'linode',
    },
  ],
};

describe('getAllRoles', () => {
  it('should return a list of roles for each access type', () => {
    const expectedRoles = [
      {
        access: accountAccess,
        entity_type: 'account',
        label: 'account_admin',
        value: 'account_admin',
      },
      {
        access: accountAccess,
        entity_type: 'linode',
        label: 'account_linode_admin',
        value: 'account_linode_admin',
      },
      {
        access: entityAccess,
        entity_type: 'linode',
        label: 'linode_contributor',
        value: 'linode_contributor',
      },
    ];

    expect(getAllRoles(accountPermissions)).toEqual(expectedRoles);
  });
});

describe('getRoleByName', () => {
  it('should return an object with details about this role account_access', () => {
    const roleName = 'account_admin';
    const expectedRole = {
      access: accountAccess,
      description:
        'Access to perform any supported action on all resources in the account',
      entity_type: 'account',
      name: 'account_admin',
      permissions: ['create_linode', 'update_linode', 'update_firewall'],
    };

    expect(getRoleByName(accountPermissions, roleName)).toEqual(expectedRole);
  });

  it('should return an object with details about this role entity_access', () => {
    const roleName = 'linode_contributor';
    const expectedRole = {
      access: entityAccess,
      description: 'Access to update a linode instance',
      entity_type: 'linode',
      name: 'linode_contributor',
      permissions: ['update_linode', 'view_linode'],
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
        access: accountAccess,
        description:
          'Access to perform any supported action on all resources in the account',
        entity_ids: null,
        entity_type: 'account',
        id: 'account_admin',
        name: 'account_admin',
        permissions: ['create_linode', 'update_linode', 'update_firewall'],
      },
      {
        access: accountAccess,
        description:
          'Access to perform any supported action on all linode instances in the account',
        entity_ids: null,
        entity_type: 'linode',
        id: 'account_linode_admin',
        name: 'account_linode_admin',
        permissions: ['create_linode', 'update_linode', 'delete_linode'],
      },
      {
        access: entityAccess,
        description: 'Access to update a linode instance',
        entity_ids: [12345678],
        entity_type: 'linode',
        id: 'linode_contributor',
        name: 'linode_contributor',
        permissions: ['update_linode', 'view_linode'],
      },
    ];

    expect(mapRolesToPermissions(accountPermissions, userRoles)).toEqual(
      expectedRoles
    );
  });
});

describe('updateUserRoles', () => {
  it('should return an object of updated users roles with resource access', () => {
    const expectedRoles = {
      account_access: ['account_linode_admin', 'linode_creator'],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_admin'],
          type: 'linode',
        },
      ],
    };

    const initialRole = 'linode_contributor';
    const newRole = 'linode_admin';
    expect(
      updateUserRoles({
        access: entityAccess,
        assignedRoles: userPermissions,
        initialRole,
        newRole,
      })
    ).toEqual(expectedRoles);
  });
});

describe('deleteUserRole', () => {
  it('should return an object of updated users roles with resource access', () => {
    const initialRole = 'linode_contributor';

    const expectedRoles = {
      account_access: ['account_linode_admin', 'linode_creator'],
      entity_access: [],
    };

    expect(
      deleteUserRole({
        access: entityAccess,
        assignedRoles: userPermissions,
        initialRole,
      })
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with resource access', () => {
    const initialRole = 'linode_contributor';

    const userPermissions = userPermissionsFactory.build();

    const expectedRoles = {
      account_access: [
        'account_linode_admin',
        'linode_creator',
        'firewall_creator',
        'account_admin',
        'account_viewer',
      ],
      entity_access: [
        {
          id: 10,
          roles: ['linode_viewer'],
          type: 'linode',
        },
        {
          id: 1,
          roles: ['firewall_admin'],
          type: 'firewall',
        },
      ],
    };

    expect(
      deleteUserRole({
        access: entityAccess,
        assignedRoles: userPermissions,
        initialRole,
      })
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with account access', () => {
    const initialRole = 'account_linode_admin';

    const expectedRoles = {
      account_access: ['linode_creator'],
      entity_access: [
        {
          id: 12345678,
          roles: ['linode_contributor'],
          type: 'linode',
        },
      ],
    };

    expect(
      deleteUserRole({
        access: accountAccess,
        assignedRoles: userPermissions,
        initialRole,
      })
    ).toEqual(expectedRoles);
  });
});

describe('changeRoleForEntity', () => {
  it('should return the same object of users roles when change the same role', () => {
    const initialRole = 'linode_contributor';
    const newRole = 'linode_contributor';
    const entityId = 12345678;
    const entityType = 'linode';
    const expectedRoles = userPermissions.entity_access;

    expect(
      changeRoleForEntity(
        userPermissions.entity_access,
        entityId,
        entityType,
        initialRole,
        newRole
      )
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with entity access when changing from "linode_contributor" to "linode_viewer"', () => {
    const initialRole = 'linode_contributor';
    const newRole = 'linode_viewer';
    const entityId = 12345678;
    const entityType = 'linode';
    const expectedRoles = [
      {
        id: 12345678,
        roles: ['linode_viewer'],
        type: 'linode',
      },
    ];

    expect(
      changeRoleForEntity(
        userPermissions.entity_access,
        entityId,
        entityType,
        initialRole,
        newRole
      )
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with entity access when changing role from "linode_contributor" to "linode_viewer"', () => {
    const userPermissions: IamUserPermissions = {
      account_access: ['account_linode_admin', 'linode_creator'],
      entity_access: [
        {
          id: 2,
          roles: ['linode_contributor'],
          type: 'linode',
        },
        {
          id: 1,
          roles: ['linode_contributor', 'linode_viewer'],
          type: 'linode',
        },
      ],
    };
    const initialRole = 'linode_contributor';
    const newRole = 'linode_viewer';
    const entityId = 1;
    const entityType = 'linode';
    const expectedRoles = [
      {
        id: 2,
        roles: ['linode_contributor'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_viewer'],
        type: 'linode',
      },
    ];

    expect(
      changeRoleForEntity(
        userPermissions.entity_access,
        entityId,
        entityType,
        initialRole,
        newRole
      )
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with entity access', () => {
    const userPermissions: IamUserPermissions = {
      account_access: ['account_linode_admin', 'linode_creator'],
      entity_access: [
        {
          id: 2,
          roles: ['linode_contributor'],
          type: 'linode',
        },
        {
          id: 1,
          roles: ['linode_contributor', 'linode_viewer'],
          type: 'linode',
        },
      ],
    };
    const initialRole = 'linode_contributor';
    const newRole = 'linode_viewer';
    const entityId = 2;
    const entityType = 'linode';
    const expectedRoles = [
      {
        id: 2,
        roles: ['linode_viewer'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_contributor', 'linode_viewer'],
        type: 'linode',
      },
    ];

    expect(
      changeRoleForEntity(
        userPermissions.entity_access,
        entityId,
        entityType,
        initialRole,
        newRole
      )
    ).toEqual(expectedRoles);
  });
});

describe('toEntityAccess', () => {
  it('should return the same object of users roles with entity access', () => {
    const expectedRoles = [
      {
        id: 2,
        roles: ['linode_contributor'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_contributor'],
        type: 'linode',
      },
    ];

    const roleName = 'linode_contributor';
    const entityIds = [2, 1];
    const roleType = 'linode';
    expect(
      toEntityAccess(
        userPermissions.entity_access,
        entityIds,
        roleName,
        roleType
      )
    ).toEqual(expectedRoles);
  });

  it('should return an object of updated users roles with entity access', () => {
    const userPermissions: EntityAccess[] = [
      {
        id: 2,
        roles: ['linode_contributor'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_contributor', 'linode_viewer'],
        type: 'linode',
      },
    ];
    const roleName = 'linode_contributor';
    const entityIds = [2];
    const expectedRoles = [
      {
        id: 2,
        roles: ['linode_contributor'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_viewer'],
        type: 'linode',
      },
    ];

    const roleType = 'linode';
    expect(
      toEntityAccess(userPermissions, entityIds, roleName, roleType)
    ).toEqual(expectedRoles);
  });
  it('should return an object of updated users roles with entity access', () => {
    const userPermissions: EntityAccess[] = [
      {
        id: 2,
        roles: ['linode_contributor'],
        type: 'linode',
      },
      {
        id: 1,
        roles: ['linode_contributor', 'linode_viewer'],
        type: 'linode',
      },
    ];
    const roleName = 'linode_contributor';
    const entityIds = [1];
    const roleType = 'linode';
    const expectedRoles = [
      {
        id: 1,
        roles: ['linode_contributor', 'linode_viewer'],
        type: 'linode',
      },
    ];
    expect(
      toEntityAccess(userPermissions, entityIds, roleName, roleType)
    ).toEqual(expectedRoles);
  });
});