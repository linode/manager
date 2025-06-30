import type { FirewallAdmin, GrantLevel } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const firewallGrantsToPermissions = (
  grantLevel?: GrantLevel
): Record<FirewallAdmin, boolean> => {
  return {
    delete_firewall: grantLevel === 'read_write',
    delete_firewall_device: grantLevel === 'read_write',
    create_firewall_device: grantLevel === 'read_write',
    update_firewall: grantLevel === 'read_write',
    update_firewall_rules: grantLevel === 'read_write',
    list_firewall_devices: grantLevel !== null,
    list_firewall_rule_versions: grantLevel !== null,
    list_firewall_rules: grantLevel !== null,
    view_firewall: grantLevel !== null,
    view_firewall_device: grantLevel !== null,
    view_firewall_rule_version: grantLevel !== null,
  };
};
