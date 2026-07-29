import { createUserRoles } from '../../factories';
import { getTfaStatus, getTotalAssignedRoles } from './utils';

describe('getTfaStatus', () => {
  describe('when enforcement feature flag is enabled', () => {
    it('should return "Enforced, active" when TFA is enabled and enforced', () => {
      const result = getTfaStatus(true, true, true);
      expect(result).toEqual({
        iconStatus: 'active',
        label: 'Enforced, active',
      });
    });

    it('should return "Enforced, awaiting user configuration" when TFA is enforced but not enabled', () => {
      const result = getTfaStatus(false, true, true);
      expect(result).toEqual({
        iconStatus: 'other',
        label: 'Enforced, awaiting user configuration',
      });
    });

    it('should return "Active" when TFA is enabled but not enforced', () => {
      const result = getTfaStatus(true, false, true);
      expect(result).toEqual({ iconStatus: 'active', label: 'Active' });
    });

    it('should return "Inactive" when TFA is neither enabled nor enforced', () => {
      const result = getTfaStatus(false, false, true);
      expect(result).toEqual({ iconStatus: 'inactive', label: 'Inactive' });
    });
  });

  // TODO: Remove this describe block once 2FA enforcement is fully released.
  describe('when enforcement feature flag is disabled', () => {
    it('should return "Enabled" when TFA is enabled', () => {
      const result = getTfaStatus(true, true, false);
      expect(result).toEqual({ iconStatus: 'active', label: 'Enabled' });
    });

    it('should return "Disabled" when TFA is not enabled', () => {
      const result = getTfaStatus(false, true, false);
      expect(result).toEqual({ iconStatus: 'inactive', label: 'Disabled' });
    });
  });
});

describe('getTotalAssignedRoles', () => {
  it('should return the correct total number of assigned roles', () => {
    const mockPermissions = createUserRoles({
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
    const mockPermissions = createUserRoles({
      account_access: [],
      entity_access: [],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    expect(result).toBe(0);
  });

  it('should handle missing entity_access gracefully', () => {
    const mockPermissions = createUserRoles({
      account_access: ['account_admin'],
      entity_access: [],
    });

    const result = getTotalAssignedRoles(mockPermissions);

    expect(result).toBe(1);
  });

  it('should handle missing account_access gracefully', () => {
    const mockPermissions = createUserRoles({
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
