import type { EntityType } from '../entities/types';

export type AccountType = 'account';

export type AccessType = AccountType | EntityType;

export type AccountRoleType =
  | 'account_admin'
  | 'account_billing_admin'
  | 'account_billing_viewer'
  | 'account_database_creator'
  | 'account_domain_creator'
  | 'account_event_viewer'
  | 'account_firewall_admin'
  | 'account_firewall_creator'
  | 'account_image_creator'
  | 'account_ip_admin'
  | 'account_ip_viewer'
  | 'account_linode_admin'
  | 'account_linode_creator'
  | 'account_lkecluster_creator'
  | 'account_longview_creator'
  | 'account_longview_subscription_admin'
  | 'account_maintenance_viewer'
  | 'account_nodebalancer_creator'
  | 'account_notification_viewer'
  | 'account_oauth_client_admin'
  | 'account_oauth_client_viewer'
  | 'account_placement_group_creator'
  | 'account_stackscript_creator'
  | 'account_viewer'
  | 'account_vlan_admin'
  | 'account_vlan_viewer'
  | 'account_volume_creator'
  | 'account_vpc_creator';

export type EntityRoleType =
  | 'database_admin'
  | 'database_viewer'
  | 'domain_admin'
  | 'domain_viewer'
  | 'firewall_admin'
  | 'firewall_contributor'
  | 'firewall_viewer'
  | 'image_admin'
  | 'image_viewer'
  | 'linode_admin'
  | 'linode_contributor'
  | 'linode_viewer'
  | 'lkecluster_admin'
  | 'lkecluster_viewer'
  | 'longview_admin'
  | 'longview_viewer'
  | 'nodebalancer_admin'
  | 'nodebalancer_viewer'
  | 'placement_group_admin'
  | 'placement_group_viewer'
  | 'stackscript_admin'
  | 'stackscript_viewer'
  | 'volume_admin'
  | 'volume_viewer'
  | 'vpc_admin'
  | 'vpc_viewer';

export type RoleName = AccountRoleType | EntityRoleType;

/**
 * Permissions associated with the "account_admin" role.
 * Note: Permissions associated with profile have been excluded as all users have access to their own profile.
 * This is to align with the permissions API array.
 */
export type AccountAdmin =
  | 'accept_service_transfer'
  | 'acknowledge_account_agreement'
  | 'cancel_account'
  | 'cancel_service_transfer'
  | 'create_service_transfer'
  | 'create_user'
  | 'delete_user'
  | 'enable_managed'
  | 'enroll_beta_program'
  | 'is_account_admin'
  | 'list_account_agreements'
  | 'list_account_logins'
  | 'list_available_services'
  | 'list_default_firewalls'
  | 'list_service_transfers'
  | 'list_user_grants'
  | 'update_account'
  | 'update_account_settings'
  | 'update_user'
  | 'update_user_grants'
  | 'view_account'
  | 'view_account_login'
  | 'view_account_settings'
  | 'view_enrolled_beta_program'
  | 'view_network_usage'
  | 'view_region_available_service'
  | 'view_service_transfer'
  | 'view_user'
  | 'view_user_preferences'
  | AccountBillingAdmin
  | AccountFirewallAdmin
  | AccountLinodeAdmin
  | AccountNodeBalancerAdmin
  | AccountOauthClientAdmin
  | AccountVolumeAdmin
  | AccountVPCAdmin;

/** Permissions associated with the "account_billing_admin" role. */
export type AccountBillingAdmin =
  | 'create_payment_method'
  | 'create_promo_code'
  | 'delete_payment_method'
  | 'make_billing_payment'
  | 'set_default_payment_method'
  | AccountBillingViewer;

/** Permissions associated with the "account_billing_viewer" role. */
export type AccountBillingViewer =
  | 'list_billing_invoices'
  | 'list_billing_payments'
  | 'list_invoice_items'
  | 'list_payment_methods'
  | 'view_billing_invoice'
  | 'view_billing_payment'
  | 'view_payment_method';

/** Permissions associated with the "account_event_viewer" role. */
export type AccountEventViewer =
  | 'list_events'
  | 'mark_event_seen'
  | 'view_event';

/** Permissions associated with the "account_firewall_admin" role. */
export type AccountFirewallAdmin = AccountFirewallCreator | FirewallAdmin;

/** Permissions associated with the "account_firewall_creator" role. */
export type AccountFirewallCreator = 'create_firewall';

/** Permissions associated with the "account_vpc_admin" role. */
export type AccountVPCAdmin = AccountVPCCreator | VPCAdmin;

/** Permissions associated with the "account_vpc_creator" role. */
export type AccountVPCCreator = 'create_vpc';

/** Permissions associated with the "account_linode_admin" role. */
export type AccountLinodeAdmin = AccountLinodeCreator | LinodeAdmin;

/** Permissions associated with the "account_linode_creator" role. */
export type AccountLinodeCreator = 'create_linode';

/** Permissions associated with the "account_nodebalancer_admin" role. */
export type AccountNodeBalancerAdmin =
  | AccountNodeBalancerCreator
  | NodeBalancerAdmin;

/** Permissions associated with the "account_nodebalancer_creator" role. */
export type AccountNodeBalancerCreator = 'create_nodebalancer';

/** Permissions associated with the "account_volume_admin" role. */
export type AccountVolumeAdmin = AccountVolumeCreator | VolumeAdmin;

/** Permissions associated with the "account_volume_creator" role. */
export type AccountVolumeCreator = 'create_volume';

/** Permissions associated with the "account_maintenance_viewer" role. */
export type AccountMaintenanceViewer = 'list_maintenances';

/** Permissions associated with the "account_notification_viewer" role. */
export type AccountNotificationViewer = 'list_notifications';

/** Permissions associated with the "account_oauth_client_admin" role. */
export type AccountOauthClientAdmin =
  | 'create_oauth_client'
  | 'delete_oauth_client'
  | 'reset_oauth_client_secret'
  | 'update_oauth_client'
  | 'update_oauth_client_thumbnail'
  | AccountOauthClientViewer;

/** Permissions associated with the "account_oauth_client_viewer" role. */
export type AccountOauthClientViewer =
  | 'list_oauth_clients'
  | 'view_oauth_client'
  | 'view_oauth_client_thumbnail';

/**
 * Permissions associated with the user profile.
 * Note: There is no "profile_viewer" role as the profile is always viewable by the user.
 * However, this is a UI type to facilitate UX integration and type safety.
 */
export type AccountProfileViewer =
  | 'list_profile_apps'
  | 'list_profile_devices'
  | 'list_profile_grants'
  | 'list_profile_logins'
  | 'list_profile_pats'
  | 'list_profile_security_questions'
  | 'list_profile_ssh_keys'
  | 'view_profile'
  | 'view_profile_app'
  | 'view_profile_device'
  | 'view_profile_login'
  | 'view_profile_pat'
  | 'view_profile_ssh_key';

/** Permissions associated with the "account_viewer" role. */
export type AccountViewer =
  | 'list_account_agreements'
  | 'list_account_logins'
  | 'list_available_services'
  | 'list_default_firewalls'
  | 'list_enrolled_beta_programs'
  | 'list_service_transfers'
  | 'list_user_grants'
  | 'view_account'
  | 'view_account_login'
  | 'view_account_settings'
  | 'view_enrolled_beta_program'
  | 'view_network_usage'
  | 'view_region_available_service'
  | 'view_service_transfer'
  | 'view_user'
  | 'view_user_preferences'
  | AccountBillingViewer
  | AccountEventViewer
  | AccountMaintenanceViewer
  | AccountNotificationViewer
  | AccountOauthClientViewer
  | AccountProfileViewer
  | FirewallViewer
  | LinodeViewer
  | VolumeViewer;

/** Permissions associated with the "firewall_admin role. */
export type FirewallAdmin =
  | 'delete_firewall'
  | 'delete_firewall_device'
  | FirewallContributor;

/** Permissions associated with the "firewall_contributor role. */
export type FirewallContributor =
  | 'create_firewall_device'
  | 'update_firewall'
  | 'update_firewall_rules'
  | FirewallViewer;

/** Permissions associated with the "firewall_viewer" role. */
export type FirewallViewer =
  | 'list_firewall_devices'
  | 'list_firewall_rule_versions'
  | 'list_firewall_rules'
  | 'view_firewall'
  | 'view_firewall_device'
  | 'view_firewall_rule_version';

/** Permissions associated with the "vpc_admin" role. */
export type VPCAdmin = 'delete_vpc' | 'delete_vpc_subnet' | VPCContributor;

/** Permissions associated with the "vpc_contributor role. */
export type VPCContributor =
  | 'create_vpc_subnet'
  | 'update_vpc'
  | 'update_vpc_subnet'
  | VPCViewer;

/** Permissions associated with the "vpc_viewer" role. */
export type VPCViewer =
  | 'list_vpc_ip_addresses'
  | 'view_vpc'
  | 'view_vpc_subnet';

/** Permissions associated with the "linode_admin" role. */
export type LinodeAdmin =
  | 'cancel_linode_backups'
  | 'delete_linode'
  | 'delete_linode_config_profile'
  | 'delete_linode_config_profile_interface'
  | 'delete_linode_disk'
  | LinodeContributor;

/** Permissions associated with the "linode_contributor" role. */
export type LinodeContributor =
  | 'apply_linode_firewalls'
  | 'boot_linode'
  | 'clone_linode'
  | 'clone_linode_disk'
  | 'create_linode_backup_snapshot'
  | 'create_linode_config_profile'
  | 'create_linode_config_profile_interface'
  | 'create_linode_disk'
  | 'enable_linode_backups'
  | 'generate_linode_lish_token'
  | 'generate_linode_lish_token_remote'
  | 'migrate_linode'
  | 'password_reset_linode'
  | 'reboot_linode'
  | 'rebuild_linode'
  | 'reorder_linode_config_profile_interfaces'
  | 'rescue_linode'
  | 'reset_linode_disk_root_password'
  | 'resize_linode'
  | 'resize_linode_disk'
  | 'restore_linode_backup'
  | 'shutdown_linode'
  | 'update_linode'
  | 'update_linode_config_profile'
  | 'update_linode_config_profile_interface'
  | 'update_linode_disk'
  | 'update_linode_firewalls'
  | 'upgrade_linode'
  | LinodeViewer;

/** Permissions associated with the "linode_viewer" role. */
export type LinodeViewer =
  | 'list_linode_firewalls'
  | 'list_linode_nodebalancers'
  | 'list_linode_volumes'
  | 'view_linode'
  | 'view_linode_backup'
  | 'view_linode_config_profile'
  | 'view_linode_config_profile_interface'
  | 'view_linode_disk'
  | 'view_linode_monthly_network_transfer_stats'
  | 'view_linode_monthly_stats'
  | 'view_linode_network_transfer'
  | 'view_linode_stats';

/** Permissions associated with the "nodebalancer_admin" role. */
// TODO: UIE-9154 - verify mapping for Nodebalancer as this is not migrated yet
export type NodeBalancerAdmin =
  | 'delete_nodebalancer'
  | 'delete_nodebalancer_config'
  | 'delete_nodebalancer_config_node'
  | NodeBalancerContributor;

/** Permissions associated with the "nodebalancer_contributor" role. */
export type NodeBalancerContributor =
  | 'create_nodebalancer_config'
  | 'create_nodebalancer_config_node'
  | 'rebuild_nodebalancer_config'
  | 'update_nodebalancer'
  | 'update_nodebalancer_config'
  | 'update_nodebalancer_config_node'
  | 'update_nodebalancer_firewalls'
  | NodeBalancerViewer;

/** Permissions associated with the "nodebalancer_viewer" role. */
export type NodeBalancerViewer =
  | 'list_nodebalancer_config_nodes'
  | 'list_nodebalancer_configs'
  | 'list_nodebalancer_firewalls'
  | 'view_nodebalancer'
  | 'view_nodebalancer_config'
  | 'view_nodebalancer_config_node'
  | 'view_nodebalancer_statistics';

/** Permissions associated with the "volume_admin" role. */
export type VolumeAdmin = 'delete_volume' | VolumeContributor;

/** Permissions associated with the "volume_contributor" role. */
export type VolumeContributor =
  | 'attach_volume'
  | 'clone_volume'
  | 'delete_volume'
  | 'detach_volume'
  | 'resize_volume'
  | 'update_volume'
  | VolumeViewer;

/** Permissions associated with the "volume_viewer" role. */
export type VolumeViewer = 'view_volume';

/** Union of all permissions */
export type PermissionType = AccountAdmin;

export interface IamUserRoles {
  account_access: AccountRoleType[];
  entity_access: EntityAccess[];
}

export interface EntityAccess {
  id: number;
  roles: EntityRoleType[];
  type: AccessType;
}

export interface IamAccountRoles {
  account_access: IamAccess[];
  entity_access: IamAccess[];
}

export interface IamAccess {
  roles: Roles[];
  type: AccessType;
}

export interface Roles {
  description: string;
  name: RoleName;
  permissions: PermissionType[];
}

export type IamAccessType = keyof IamAccountRoles;

export type PickPermissions<T extends PermissionType> = T;
