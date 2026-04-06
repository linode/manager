import type { GrantLevel, LinodeAdmin } from '@linode/api-v4';

/** Map the existing Grant model to the new IAM RBAC model. */
export const linodeGrantsToPermissions = (
  grantLevel?: GrantLevel,
  isRestricted?: boolean
): Record<LinodeAdmin, boolean> => {
  const unrestricted = isRestricted === false; // explicit === false since the profile can be undefined
  return {
    cancel_linode_backups: unrestricted || grantLevel === 'read_write',
    delete_linode: unrestricted || grantLevel === 'read_write',
    delete_linode_config_profile: unrestricted || grantLevel === 'read_write',
    delete_linode_config_profile_interface:
      unrestricted || grantLevel === 'read_write',
    delete_linode_disk: unrestricted || grantLevel === 'read_write',
    apply_linode_firewalls: unrestricted || grantLevel === 'read_write',
    boot_linode: unrestricted || grantLevel === 'read_write',
    clone_linode: unrestricted || grantLevel === 'read_write',
    clone_linode_disk: unrestricted || grantLevel === 'read_write',
    create_linode_backup_snapshot: unrestricted || grantLevel === 'read_write',
    create_linode_config_profile: unrestricted || grantLevel === 'read_write',
    create_linode_config_profile_interface:
      unrestricted || grantLevel === 'read_write',
    create_linode_disk: unrestricted || grantLevel === 'read_write',
    enable_linode_backups: unrestricted || grantLevel === 'read_write',
    generate_linode_lish_token: unrestricted || grantLevel === 'read_write',
    generate_linode_lish_token_remote:
      unrestricted || grantLevel === 'read_write',
    migrate_linode: unrestricted || grantLevel === 'read_write',
    password_reset_linode: unrestricted || grantLevel === 'read_write',
    reboot_linode: unrestricted || grantLevel === 'read_write',
    rebuild_linode: unrestricted || grantLevel === 'read_write',
    reorder_linode_config_profile_interfaces:
      unrestricted || grantLevel === 'read_write',
    rescue_linode: unrestricted || grantLevel === 'read_write',
    reset_linode_disk_root_password:
      unrestricted || grantLevel === 'read_write',
    resize_linode: unrestricted || grantLevel === 'read_write',
    resize_linode_disk: unrestricted || grantLevel === 'read_write',
    restore_linode_backup: unrestricted || grantLevel === 'read_write',
    shutdown_linode: unrestricted || grantLevel === 'read_write',
    update_linode: unrestricted || grantLevel === 'read_write',
    update_linode_config_profile: unrestricted || grantLevel === 'read_write',
    update_linode_config_profile_interface:
      unrestricted || grantLevel === 'read_write',
    update_linode_disk: unrestricted || grantLevel === 'read_write',
    update_linode_firewalls: unrestricted || grantLevel === 'read_write',
    upgrade_linode: unrestricted || grantLevel === 'read_write',
    list_linode_firewalls: unrestricted || grantLevel !== null,
    list_linode_nodebalancers: unrestricted || grantLevel !== null,
    list_linode_volumes: unrestricted || grantLevel !== null,
    view_linode: unrestricted || grantLevel !== null,
    view_linode_backup: unrestricted || grantLevel !== null,
    view_linode_config_profile: unrestricted || grantLevel !== null,
    view_linode_config_profile_interface: unrestricted || grantLevel !== null,
    view_linode_disk: unrestricted || grantLevel !== null,
    view_linode_monthly_network_transfer_stats:
      unrestricted || grantLevel !== null,
    view_linode_monthly_stats: unrestricted || grantLevel !== null,
    view_linode_network_transfer: unrestricted || grantLevel !== null,
    view_linode_stats: unrestricted || grantLevel !== null,
  };
};
