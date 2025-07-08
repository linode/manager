import type { FirewallAdmin, GrantLevel } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const firewallGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<FirewallAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false
  return {
    delete_firewall: unrestricted || grantLevel === 'read_write',
    delete_firewall_device: unrestricted || grantLevel === 'read_write',
    create_firewall_device: unrestricted || grantLevel === 'read_write',
    update_firewall: unrestricted || grantLevel === 'read_write',
    update_firewall_rules: unrestricted || grantLevel === 'read_write',
    list_firewall_devices: unrestricted || grantLevel !== null,
    list_firewall_rule_versions: unrestricted || grantLevel !== null,
    list_firewall_rules: unrestricted || grantLevel !== null,
    view_firewall: unrestricted || grantLevel !== null,
    view_firewall_device: unrestricted || grantLevel !== null,
    view_firewall_rule_version: unrestricted || grantLevel !== null,
  };
};
