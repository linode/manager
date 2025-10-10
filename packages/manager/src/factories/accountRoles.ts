import { Factory } from '@linode/utilities';

import type { IamAccountRoles } from '@linode/api-v4';

interface CreateResourceRoles {
  accountAdmin?: string[];
  admin?: string[];
  contributor?: string[];
  creator?: string[];
  viewer?: string[];
}

export const createResourceRoles = (
  resourceType: string,
  {
    accountAdmin = [],
    admin = [],
    contributor = [],
    creator = [],
    viewer = [],
  }: CreateResourceRoles
) => ({
  roles: [
    accountAdmin.length > 0
      ? {
          description: `Access to perform any supported action on all ${resourceType} instances`,
          name: `account_${resourceType}_admin`,
          permissions: accountAdmin,
        }
      : null,
    admin.length > 0
      ? {
          description: `Access to administer a ${resourceType} instance`,
          name: `${resourceType}_admin`,
          permissions: admin,
        }
      : null,
    contributor.length > 0
      ? {
          description: `Access to update a ${resourceType} instance`,
          name: `${resourceType}_contributor`,
          permissions: contributor,
        }
      : null,
    creator.length > 0
      ? {
          description: `Access to create a ${resourceType} instance`,
          name: `account_${resourceType}_creator`,
          permissions: creator,
        }
      : null,
    viewer.length > 0
      ? {
          description: `Access to view a ${resourceType} instance`,
          name: `${resourceType}_viewer`,
          permissions: viewer,
        }
      : null,
  ].filter(Boolean),
  type: resourceType,
});

export const accountRolesFactory = Factory.Sync.makeFactory<IamAccountRoles>({
  account_access: [
    {
      type: 'image',
      roles: [
        {
          name: 'account_image_creator',
          description: 'Allows the user to create Images in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'stackscript',
      roles: [
        {
          name: 'account_stackscript_creator',
          description:
            'Allows the user the same access as the legacy "Can add Stackscripts under this account" general permission.',
          permissions: [],
        },
      ],
    },
    {
      type: 'linode',
      roles: [
        {
          name: 'account_linode_creator',
          description: 'Allows the user to create Linodes in the account.',
          permissions: ['create_linode'],
        },
        {
          name: 'account_linode_admin',
          description:
            'Allows the user to list, view, update, and delete all Linode instances in the account.',
          permissions: [
            'generate_linode_lish_token_remote',
            'rebuild_linode',
            'create_linode',
            'shutdown_linode',
            'restore_linode_backup',
            'update_linode_config_profile_interface',
            'create_linode_config_profile',
            'rescue_linode',
            'delete_linode_config_profile',
            'list_linode_volumes',
            'list_linode_nodebalancers',
            'view_linode_monthly_stats',
            'view_linode_config_profile',
            'delete_linode_disk',
            'delete_linode',
            'clone_linode',
            'create_linode_config_profile_interface',
            'password_reset_linode',
            'view_linode_config_profile_interface',
            'reset_linode_disk_root_password',
            'upgrade_linode',
            'resize_linode',
            'update_linode_firewalls',
            'create_linode_backup_snapshot',
            'list_linode_firewalls',
            'boot_linode',
            'view_linode_disk',
            'clone_linode_disk',
            'view_linode_monthly_network_transfer_stats',
            'enable_linode_backups',
            'update_linode',
            'view_linode_network_transfer',
            'apply_linode_firewalls',
            'reorder_linode_config_profile_interfaces',
            'reboot_linode',
            'create_linode_disk',
            'view_linode_stats',
            'update_linode_config_profile',
            'view_linode_backup',
            'migrate_linode',
            'generate_linode_lish_token',
            'view_linode',
            'resize_linode_disk',
            'update_linode_disk',
            'cancel_linode_backups',
          ],
        },
      ],
    },
    {
      type: 'vpc',
      roles: [
        {
          name: 'account_vpc_creator',
          description: 'Allows the user to create VPCs in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'lkecluster',
      roles: [
        {
          name: 'account_lkecluster_creator',
          description:
            'Allows the user the same access as the legacy "Can add Kubernetes Clusters to this account ($)" general permission.',
          permissions: [],
        },
      ],
    },
    {
      type: 'domain',
      roles: [
        {
          name: 'account_domain_creator',
          description:
            'Allows the user the same access as the legacy "Can add Domains using the DNS Manager" general permission.',
          permissions: [],
        },
      ],
    },
    {
      type: 'volume',
      roles: [
        {
          name: 'account_volume_creator',
          description: 'Allows the user to create Volumes in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'account',
      roles: [
        {
          name: 'account_event_viewer',
          description:
            'Allows the user to list and view all events in the account.',
          permissions: ['list_events', 'view_event', 'mark_event_seen'],
        },
        {
          name: 'account_notification_viewer',
          description: 'Allows the user to list notifications in the account.',
          permissions: ['list_notifications'],
        },
        {
          name: 'account_oauth_client_viewer',
          description:
            'Allows the user to list and view all OAuth client configurations in the account.',
          permissions: [
            'list_oauth_clients',
            'view_oauth_client_thumbnail',
            'view_oauth_client',
          ],
        },
        {
          name: 'account_maintenance_viewer',
          description: 'Allows the user to list maintenances in the account.',
          permissions: ['list_maintenances'],
        },
        {
          name: 'account_oauth_client_admin',
          description:
            'Allows the user to create, list, view, update, and delete all OAuth client configurations in the account.',
          permissions: [
            'list_oauth_clients',
            'update_oauth_client',
            'update_oauth_client_thumbnail',
            'reset_oauth_client_secret',
            'create_oauth_client',
            'view_oauth_client_thumbnail',
            'view_oauth_client',
            'delete_oauth_client',
          ],
        },
        {
          name: 'account_admin',
          description:
            'Allows the user to list, view, create, update, and delete all entities in the account.',
          permissions: [
            'generate_linode_lish_token_remote',
            'list_events',
            'disable_profile_tfa',
            'view_account_settings',
            'cancel_account',
            'view_invoice_item',
            'rebuild_linode',
            'restore_linode_backup',
            'update_linode_config_profile_interface',
            'create_profile_ssh_key',
            'update_profile',
            'view_firewall_device',
            'reset_oauth_client_secret',
            'list_linode_nodebalancers',
            'view_linode_config_profile',
            'list_account_logins',
            'list_profile_pats',
            'revoke_profile_app',
            'view_user',
            'view_profile_ssh_key',
            'delete_firewall',
            'reset_linode_disk_root_password',
            'enable_managed',
            'create_firewall_device',
            'update_linode_firewalls',
            'view_firewall',
            'delete_profile_phone_number',
            'boot_linode',
            'update_oauth_client_thumbnail',
            'create_linode_disk',
            'list_profile_security_questions',
            'view_event',
            'mark_event_seen',
            'view_linode_backup',
            'create_profile_pat',
            'list_billing_payments',
            'enroll_beta_program',
            'update_oauth_client',
            'view_linode',
            'create_oauth_client',
            'is_account_admin',
            'update_profile_pat',
            'enable_profile_tfa',
            'view_account',
            'list_notifications',
            'rescue_linode',
            'list_user_grants',
            'view_user_preferences',
            'answer_profile_security_questions',
            'update_user',
            'list_linode_volumes',
            'view_profile_device',
            'view_billing_invoice',
            'view_payment_method',
            'view_linode_monthly_stats',
            'delete_linode',
            'list_firewall_rule_versions',
            'list_profile_apps',
            'view_profile_pat',
            'list_profile_grants',
            'create_service_transfer',
            'list_enrolled_beta_programs',
            'clone_linode_disk',
            'view_linode_monthly_network_transfer_stats',
            'cancel_service_transfer',
            'update_linode',
            'update_default_firewalls',
            'view_oauth_client',
            'acknowledge_account_agreement',
            'list_payment_methods',
            'view_linode_stats',
            'update_linode_config_profile',
            'list_firewall_rules',
            'generate_linode_lish_token',
            'list_oauth_clients',
            'revoke_profile_device',
            'view_billing_payment',
            'view_region_available_service',
            'cancel_linode_backups',
            'list_available_services',
            'view_firewall_rule_version',
            'view_profile_security_question',
            'verify_profile_phone_number',
            'shutdown_linode',
            'list_profile_ssh_keys',
            'create_linode_config_profile',
            'create_payment_method',
            'delete_linode_config_profile',
            'update_firewall_rules',
            'view_profile',
            'delete_oauth_client',
            'create_linode_config_profile_interface',
            'update_user_preferences',
            'password_reset_linode',
            'view_linode_config_profile_interface',
            'set_default_payment_method',
            'upgrade_linode',
            'resize_linode',
            'view_linode_disk',
            'enable_linode_backups',
            'view_linode_network_transfer',
            'create_profile_tfa_secret',
            'make_billing_payment',
            'list_account_agreements',
            'delete_profile_pat',
            'list_invoice_items',
            'list_profile_logins',
            'view_enrolled_beta_program',
            'view_service_transfer',
            'view_oauth_client_thumbnail',
            'create_user',
            'view_account_login',
            'create_linode',
            'update_account_settings',
            'update_profile_ssh_key',
            'delete_payment_method',
            'list_profile_devices',
            'update_account',
            'list_firewall_devices',
            'delete_linode_disk',
            'list_service_transfers',
            'clone_linode',
            'view_profile_app',
            'list_maintenances',
            'create_linode_backup_snapshot',
            'list_linode_firewalls',
            'list_billing_invoices',
            'delete_firewall_device',
            'apply_linode_firewalls',
            'reorder_linode_config_profile_interfaces',
            'reboot_linode',
            'delete_profile_ssh_key',
            'list_default_firewalls',
            'create_promo_code',
            'view_network_usage',
            'delete_linode_config_profile_interface',
            'migrate_linode',
            'resize_linode_disk',
            'update_firewall',
            'send_profile_phone_number_verification_code',
            'create_firewall',
            'update_linode_disk',
            'accept_service_transfer',
            'update_user_grants',
            'delete_user',
            'view_profile_login',
          ],
        },
        {
          name: 'account_viewer',
          description:
            'Allows the user to list and view all entities in the account.',
          permissions: [
            'list_events',
            'view_account_settings',
            'view_invoice_item',
            'list_profile_ssh_keys',
            'view_firewall_device',
            'list_linode_nodebalancers',
            'view_linode_config_profile',
            'view_profile',
            'list_account_logins',
            'list_profile_pats',
            'view_profile_ssh_key',
            'view_linode_config_profile_interface',
            'view_firewall',
            'view_linode_disk',
            'view_linode_network_transfer',
            'list_profile_security_questions',
            'view_event',
            'mark_event_seen',
            'list_account_agreements',
            'view_linode_backup',
            'list_invoice_items',
            'list_profile_logins',
            'list_billing_payments',
            'view_enrolled_beta_program',
            'view_service_transfer',
            'view_linode',
            'view_oauth_client_thumbnail',
            'view_account_login',
            'view_account',
            'list_notifications',
            'list_profile_devices',
            'view_user_preferences',
            'list_linode_volumes',
            'view_profile_device',
            'view_billing_invoice',
            'view_payment_method',
            'view_linode_monthly_stats',
            'list_firewall_devices',
            'list_service_transfers',
            'view_profile_app',
            'list_firewall_rule_versions',
            'list_maintenances',
            'list_profile_apps',
            'view_profile_pat',
            'list_profile_grants',
            'list_enrolled_beta_programs',
            'list_linode_firewalls',
            'list_billing_invoices',
            'view_linode_monthly_network_transfer_stats',
            'list_default_firewalls',
            'view_oauth_client',
            'list_payment_methods',
            'view_network_usage',
            'view_linode_stats',
            'list_firewall_rules',
            'list_oauth_clients',
            'view_billing_payment',
            'view_region_available_service',
            'list_available_services',
            'view_firewall_rule_version',
            'view_profile_security_question',
            'view_profile_login',
          ],
        },
        {
          name: 'account_billing_viewer',
          description:
            'Allows the user to list and view all payments, invoices, and payment methods in the account.',
          permissions: [
            'list_billing_invoices',
            'list_billing_payments',
            'view_invoice_item',
            'view_billing_invoice',
            'view_payment_method',
            'view_billing_payment',
            'list_payment_methods',
            'list_invoice_items',
          ],
        },
        {
          name: 'account_billing_admin',
          description:
            'Allows the user to list and view all payments, invoices, and payment methods in the account, as well as make payments, create promo codes, and create, update, and delete payment methods.',
          permissions: [
            'list_billing_invoices',
            'view_invoice_item',
            'make_billing_payment',
            'create_promo_code',
            'list_payment_methods',
            'list_invoice_items',
            'create_payment_method',
            'delete_payment_method',
            'list_billing_payments',
            'view_billing_invoice',
            'view_payment_method',
            'view_billing_payment',
            'set_default_payment_method',
          ],
        },
      ],
    },
    {
      type: 'nodebalancer',
      roles: [
        {
          name: 'account_nodebalancer_creator',
          description:
            'Allows the user to create NodeBalancers in the account.',
          permissions: [],
        },
      ],
    },
    {
      type: 'database',
      roles: [
        {
          name: 'account_database_creator',
          description:
            'Allows the user the same access as the legacy "Can add Databases to this account ($)" general permission.',
          permissions: [],
        },
      ],
    },
    {
      type: 'longview',
      roles: [
        {
          name: 'account_longview_subscription_admin',
          description:
            'Allows the user the same access as the legacy "Can modify this account\'s Longview subscription ($)" general permission.',
          permissions: [],
        },
        {
          name: 'account_longview_creator',
          description:
            'Allows the user the same access as the legacy "Can add Longview clients to this account" general permission.',
          permissions: [],
        },
      ],
    },
    {
      type: 'firewall',
      roles: [
        {
          name: 'account_firewall_admin',
          description:
            'Allows the user to list, view, update, and delete all firewall instances in the account.',
          permissions: [
            'view_firewall',
            'list_firewall_rules',
            'view_firewall_device',
            'update_firewall',
            'delete_firewall_device',
            'create_firewall',
            'update_firewall_rules',
            'list_firewall_devices',
            'delete_firewall',
            'view_firewall_rule_version',
            'list_firewall_rule_versions',
            'create_firewall_device',
          ],
        },
        {
          name: 'account_firewall_creator',
          description: 'Allows the user to create firewalls in the account.',
          permissions: ['create_firewall'],
        },
      ],
    },
  ],
  entity_access: [
    {
      type: 'domain',
      roles: [
        {
          name: 'domain_admin',
          description:
            'Allows the user the same access as the legacy Read-Write special permission for the Domains attached to this role.',
          permissions: [],
        },
        {
          name: 'domain_viewer',
          description:
            'Allows the user the same access as the legacy Read-Only special permission for the Domains attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'stackscript',
      roles: [
        {
          name: 'stackscript_admin',
          description:
            'Allows the user the same access as the legacy Read-Write special permission for the Stackscripts attached to this role.',
          permissions: [],
        },
        {
          name: 'stackscript_viewer',
          description:
            'Allows the user the same access as the legacy Read-Only special permission for the Stackscripts attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'image',
      roles: [
        {
          name: 'image_admin',
          description:
            'Allows the user to view, update, replicate, and delete Image instances attached to this role.',
          permissions: [],
        },
        {
          name: 'image_viewer',
          description:
            'Allows the user to view Volume instances attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'vpc',
      roles: [
        {
          name: 'vpc_admin',
          description:
            'Allows the user to view, update, and delete VPC instances attached to this role, as well as view, create, update, and delete their subnets. ',
          permissions: [],
        },
        {
          name: 'vpc_viewer',
          description:
            'Allows the user to view VPC instances attached to this role and their subnets.',
          permissions: [],
        },
      ],
    },
    {
      type: 'nodebalancer',
      roles: [
        {
          name: 'nodebalancer_viewer',
          description:
            'Allows the user to view NodeBalancer instances attached to this role and their configs.',
          permissions: [],
        },
        {
          name: 'nodebalancer_admin',
          description:
            'Allows the user to view, update, and delete NodeBalancer instances attached to this role, as well as create, list, view, update, and delete their configs.',
          permissions: [],
        },
      ],
    },
    {
      type: 'volume',
      roles: [
        {
          name: 'volume_admin',
          description:
            'Allows the user to view, update, attach, clone, detach, resize, and delete Volume instances attached to this role.',
          permissions: [],
        },
        {
          name: 'volume_viewer',
          description:
            'Allows the user to view Volume instances attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'longview',
      roles: [
        {
          name: 'longview_viewer',
          description:
            'Allows the user the same access as the legacy Read-Only special permission for the Longview clients attached to this role.',
          permissions: [],
        },
        {
          name: 'longview_admin',
          description:
            'Allows the user the same access as the legacy Read-Write special permission for the Longview clients attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'linode',
      roles: [
        {
          name: 'linode_viewer',
          description:
            'Allows the user to view Linode instances attached to this role and their backups, config profiles, and disks.',
          permissions: [
            'list_linode_firewalls',
            'list_linode_volumes',
            'view_linode_disk',
            'view_linode',
            'view_linode_monthly_network_transfer_stats',
            'view_linode_network_transfer',
            'list_linode_nodebalancers',
            'view_linode_monthly_stats',
            'view_linode_config_profile',
            'view_linode_stats',
            'view_linode_backup',
            'view_linode_config_profile_interface',
          ],
        },
        {
          name: 'linode_contributor',
          description:
            'Allows the user to view and update Linode instances attached to this role, as well as create, list, view, and update their backups, config profiles, and disks.',
          permissions: [
            'generate_linode_lish_token_remote',
            'rebuild_linode',
            'shutdown_linode',
            'restore_linode_backup',
            'update_linode_config_profile_interface',
            'create_linode_config_profile',
            'rescue_linode',
            'list_linode_volumes',
            'list_linode_nodebalancers',
            'view_linode_monthly_stats',
            'view_linode_config_profile',
            'clone_linode',
            'create_linode_config_profile_interface',
            'password_reset_linode',
            'view_linode_config_profile_interface',
            'reset_linode_disk_root_password',
            'upgrade_linode',
            'resize_linode',
            'update_linode_firewalls',
            'create_linode_backup_snapshot',
            'list_linode_firewalls',
            'boot_linode',
            'view_linode_disk',
            'clone_linode_disk',
            'view_linode_monthly_network_transfer_stats',
            'enable_linode_backups',
            'update_linode',
            'view_linode_network_transfer',
            'apply_linode_firewalls',
            'reorder_linode_config_profile_interfaces',
            'reboot_linode',
            'create_linode_disk',
            'view_linode_stats',
            'update_linode_config_profile',
            'view_linode_backup',
            'migrate_linode',
            'generate_linode_lish_token',
            'view_linode',
            'resize_linode_disk',
            'update_linode_disk',
          ],
        },
        {
          name: 'linode_admin',
          description:
            'Allows the user to view, update, and delete Linode instances attached to this role, as well as create, list, view, update, and delete their backups, config profiles, and disks.',
          permissions: [
            'generate_linode_lish_token_remote',
            'rebuild_linode',
            'shutdown_linode',
            'restore_linode_backup',
            'update_linode_config_profile_interface',
            'create_linode_config_profile',
            'rescue_linode',
            'delete_linode_config_profile',
            'list_linode_volumes',
            'list_linode_nodebalancers',
            'view_linode_monthly_stats',
            'view_linode_config_profile',
            'delete_linode_disk',
            'delete_linode',
            'clone_linode',
            'create_linode_config_profile_interface',
            'password_reset_linode',
            'view_linode_config_profile_interface',
            'reset_linode_disk_root_password',
            'upgrade_linode',
            'resize_linode',
            'update_linode_firewalls',
            'create_linode_backup_snapshot',
            'list_linode_firewalls',
            'boot_linode',
            'view_linode_disk',
            'clone_linode_disk',
            'view_linode_monthly_network_transfer_stats',
            'enable_linode_backups',
            'update_linode',
            'view_linode_network_transfer',
            'apply_linode_firewalls',
            'reorder_linode_config_profile_interfaces',
            'reboot_linode',
            'create_linode_disk',
            'view_linode_stats',
            'update_linode_config_profile',
            'view_linode_backup',
            'delete_linode_config_profile_interface',
            'migrate_linode',
            'generate_linode_lish_token',
            'view_linode',
            'resize_linode_disk',
            'update_linode_disk',
            'cancel_linode_backups',
          ],
        },
      ],
    },
    {
      type: 'lkecluster',
      roles: [
        {
          name: 'lkecluster_viewer',
          description:
            'Allows the user the same access as the legacy Read-Only special permission for the LKE clusters attached to this role.',
          permissions: [],
        },
        {
          name: 'lkecluster_admin',
          description:
            'Allows the user the same access as the legacy Read-Write special permission for the LKE clusters attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'database',
      roles: [
        {
          name: 'database_viewer',
          description:
            'Allows the user the same access as the legacy Read-Only special permission for the Databases attached to this role.',
          permissions: [],
        },
        {
          name: 'database_admin',
          description:
            'Allows the user the same access as the legacy Read-Write special permission for the Databases attached to this role.',
          permissions: [],
        },
      ],
    },
    {
      type: 'firewall',
      roles: [
        {
          name: 'firewall_contributor',
          description:
            'Allows the user to view and update firewall instances attached to this role, as well as view their devices and view and update their rules.',
          permissions: [
            'view_firewall',
            'list_firewall_rules',
            'view_firewall_device',
            'update_firewall',
            'update_firewall_rules',
            'list_firewall_devices',
            'view_firewall_rule_version',
            'list_firewall_rule_versions',
            'create_firewall_device',
          ],
        },
        {
          name: 'firewall_viewer',
          description:
            'Allows the user to view firewall instances attached to this role, as well as list and view their devices and rules.',
          permissions: [
            'view_firewall',
            'list_firewall_rules',
            'view_firewall_device',
            'list_firewall_devices',
            'view_firewall_rule_version',
            'list_firewall_rule_versions',
          ],
        },
        {
          name: 'firewall_admin',
          description:
            'Allows the user to view, update, and delete firewall instances in the account as well as view, create, and delete their devices and rules. ',
          permissions: [
            'view_firewall',
            'list_firewall_rules',
            'view_firewall_device',
            'update_firewall',
            'delete_firewall_device',
            'update_firewall_rules',
            'list_firewall_devices',
            'delete_firewall',
            'view_firewall_rule_version',
            'list_firewall_rule_versions',
            'create_firewall_device',
          ],
        },
      ],
    },
  ],
});
