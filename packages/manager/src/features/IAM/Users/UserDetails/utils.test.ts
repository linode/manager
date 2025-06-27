import { userRolesFactory } from 'src/factories/userRoles';

import { getTotalAssignedRoles } from './utils';

describe('getTotalAssignedRoles', () => {
  it('should return the correct total number of assigned roles', () => {
    const mockPermissions = userRolesFactory.build({
      account_access: ['account_linode_admin', 'account_linode_creator'],
      entity_access: [
        {
          id: 1,
          roles: ['firewall_admin', 'firewall_viewer'],
          type: 'firewall',
        },
        {
          id: 2,
          roles: ['firewall_admin'], // Duplicate role
          type: 'firewall',
        },
      ],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    // Expect unique roles
    expect(result).toBe(4);
  });

  it('should return 0 if no roles are assigned', () => {
    const mockPermissions = userRolesFactory.build({
      account_access: [],
      entity_access: [],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    expect(result).toBe(0);
  });

  it('should handle missing entity_access gracefully', () => {
    const mockPermissions = userRolesFactory.build({
      account_access: ['account_admin'],
      entity_access: [],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    expect(result).toBe(1);
  });

  it('should handle missing account_access gracefully', () => {
    const mockPermissions = userRolesFactory.build({
      account_access: [],
      entity_access: [
        {
          id: 1,
          roles: ['firewall_admin'],
          type: 'firewall',
        },
      ],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    expect(result).toBe(1);
  });
});
