import { Factory } from '@linode/utilities';

import type { IamAccess, IamAccountPermissions } from '@linode/api-v4';

interface CreateResourceRoles {
  accountAdmin?: string[];
  admin?: string[];
  contributor?: string[];
  creator?: string[];
  viewer?: string[];
}

const createResourceRoles = (
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
          name: `${resourceType}_creator`,
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

export const accountPermissionsFactory = Factory.Sync.makeFactory<IamAccountPermissions>(
  {
    account_access: [
      {
        roles: [
          {
            description:
              'Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account. Access to view all resources in the account.',
            name: 'account_viewer',
            permissions: [
              'list_account_agreements',
              'list_account_logins',
              'list_available_services',
              'list_child_accounts',
              'list_events',
              'list_linode_backups',
              'list_linode_config_profile_interfaces',
              'list_linode_config_profiles',
              'list_linode_disks',
              'list_linode_firewalls',
              'list_linode_kernels',
              'list_linode_nodebalancers',
              'list_linode_types',
              'list_linode_volumes',
              'list_nodebalancer_config_nodes',
              'list_nodebalancer_configs',
              'list_nodebalancer_firewalls',
              'list_notifications',
              'list_oauth_clients',
              'list_service_transfers',
              'list_users',
              'list_vpc_ip_addresses',
              'list_vpc_subnets',
              'view_account_settings',
              'view_account',
              'view_image',
              'view_linode_backup',
              'view_linode_config_profile_interface',
              'view_linode_config_profile',
              'view_linode_disk',
              'view_linode_ip_address',
              'view_linode_kernel',
              'view_linode_monthly_network_transfer_stats',
              'view_linode_monthly_stats',
              'view_linode_network_transfer',
              'view_linode_networking_info',
              'view_linode_stats',
              'view_linode_type',
              'view_linode',
              'view_network_usage',
              'view_nodebalancer_config_node',
              'view_nodebalancer_config',
              'view_nodebalancer_statistics',
              'view_nodebalancer',
              'view_user',
              'view_volume',
              'view_vpc_subnet',
              'view_vpc',
            ],
          },
          {
            description:
              'Access to perform any supported action on all resources in the account',
            name: 'account_admin',
            permissions: [
              'acknowledge_account_agreement',
              'add_nodebalancer_config_node',
              'add_nodebalancer_config',
              'allocate_ip',
              'allocate_linode_ip_address',
              'assign_ips',
              'assign_ipv4',
              'attach_volume',
              'boot_linode',
              'cancel_linode_backups',
              'clone_linode_disk',
              'clone_linode',
              'clone_volume',
              'create_firewall_device',
              'create_firewall',
              'create_image',
              'create_ipv6_range',
              'create_linode_backup_snapshot',
              'create_linode_config_profile_interface',
              'create_linode_config_profile',
              'create_linode_disk',
              'create_linode',
              'create_nodebalancer',
              'create_oauth_client',
              'create_service_transfer',
              'create_user',
              'create_volume',
              'create_vpc_subnet',
              'create_vpc',
              'delete_firewall_device',
              'delete_firewall',
              'delete_image',
              'delete_linode_config_profile_interface',
              'delete_linode_config_profile',
              'delete_linode_disk',
              'delete_linode_ip_address',
              'delete_linode',
              'delete_nodebalancer_config_node',
              'delete_nodebalancer_config',
              'delete_nodebalancer',
              'delete_user',
              'delete_volume',
              'delete_vpc_subnet',
              'delete_vpc',
              'detach_volume',
              'enable_linode_backups',
              'enable_managed',
              'enroll_beta_program',
              'list_account_agreements',
              'list_account_logins',
              'list_all_vpc_ipaddresses',
              'list_available_services',
              'list_child_accounts',
              'list_enrolled_beta_programs',
              'list_events',
              'list_firewall_devices',
              'list_firewalls',
              'list_images',
              'list_linode_backups',
              'list_linode_config_profile_interfaces',
              'list_linode_config_profiles',
              'list_linode_disks',
              'list_linode_firewalls',
              'list_linode_kernels',
              'list_linode_nodebalancers',
              'list_linode_types',
              'list_linode_volumes',
              'list_linodes',
              'list_maintenances',
              'list_nodebalancer_config_nodes',
              'list_nodebalancer_configs',
              'list_nodebalancer_firewalls',
              'list_nodebalancers',
              'list_notifications',
              'list_oauth_clients',
              'list_service_transfers',
              'list_users',
              'list_volumes',
              'list_vpc_ip_addresses',
              'list_vpc_subnets',
              'list_vpcs',
              'migrate_linode',
              'password_reset_linode',
              'reboot_linode',
              'rebuild_linode',
              'rebuild_nodebalancer_config',
              'reorder_linode_config_profile_interfaces',
              'rescue_linode',
              'reset_linode_disk_root_password',
              'resize_linode_disk',
              'resize_linode',
              'resize_volume',
              'restore_linode_backup',
              'share_ips',
              'share_ipv4',
              'shutdown_linode',
              'update_account_settings',
              'update_account',
              'update_firewall_rules',
              'update_firewall',
              'update_image',
              'update_linode_config_profile_interface',
              'update_linode_config_profile',
              'update_linode_disk',
              'update_linode_ip_address',
              'update_nodebalancer_config_node',
              'update_nodebalancer_config',
              'update_nodebalancer',
              'update_user',
              'update_volume',
              'update_vpc_subnet',
              'update_vpc',
              'upgrade_linode',
              'upload_image',
              'view_account_settings',
              'view_account',
              'view_firewall_device',
              'view_firewall',
              'view_image',
              'view_linode_backup',
              'view_linode_config_profile_interface',
              'view_linode_config_profile',
              'view_linode_disk',
              'view_linode_ip_address',
              'view_linode_kernel',
              'view_linode_monthly_network_transfer_stats',
              'view_linode_monthly_stats',
              'view_linode_network_transfer',
              'view_linode_networking_info',
              'view_linode_stats',
              'view_linode_type',
              'view_linode',
              'view_network_usage',
              'view_nodebalancer_config_node',
              'view_nodebalancer_config',
              'view_nodebalancer_statistics',
              'view_nodebalancer',
              'view_user',
              'view_volume',
              'view_vpc_subnet',
              'view_vpc',
            ],
          },
          {
            description:
              'Access to perform any supported action on all linode instances in the account',
            name: 'account_retail_owner',
            permissions: ['cancel_account'],
          },
          {
            description: 'Access to view bills, payments in the account',
            name: 'billing_viewer',
            permissions: [
              'list_invoice_items',
              'list_invoices',
              'list_payment_methods',
              'list_payments',
              'view_invoice',
              'view_payment_method',
              'view_payment',
            ],
          },
          {
            description:
              'Access to view bills, and make payments in the account',
            name: 'billing_admin',
            permissions: [
              'create_payment_method',
              'create_promo_code',
              'delete_payment_method',
              'list_invoice_items',
              'list_invoices',
              'list_payment_methods',
              'list_payments',
              'make_payment',
              'set_default_payment_method',
              'view_invoice',
              'view_payment_method',
              'view_payment',
            ],
          },
        ],
        type: 'account',
      },
      createResourceRoles('linode', {
        accountAdmin: [
          'allocate_ip',
          'allocate_linode_ip_address',
          'assign_ips',
          'assign_ipv4',
          'boot_linode',
          'cancel_linode_backups',
          'clone_linode_disk',
          'clone_linode',
          'create_ipv6_range',
          'create_linode_backup_snapshot',
          'create_linode_config_profile_interface',
          'create_linode_config_profile',
          'create_linode_disk',
          'create_linode',
          'delete_linode_config_profile_interface',
          'delete_linode_config_profile',
          'delete_linode_disk',
          'delete_linode_ip_address',
          'delete_linode',
          'enable_linode_backups',
          'list_linode_backups',
          'list_linode_config_profile_interfaces',
          'list_linode_config_profiles',
          'list_linode_disks',
          'list_linode_firewalls',
          'list_linode_kernels',
          'list_linode_nodebalancers',
          'list_linode_types',
          'list_linode_volumes',
          'list_linodes',
          'migrate_linode',
          'password_reset_linode',
          'reboot_linode',
          'rebuild_linode',
          'reorder_linode_config_profile_interfaces',
          'rescue_linode',
          'reset_linode_disk_root_password',
          'resize_linode_disk',
          'resize_linode',
          'restore_linode_backup',
          'share_ips',
          'share_ipv4',
          'shutdown_linode',
          'update_linode_config_profile_interface',
          'update_linode_config_profile',
          'update_linode_disk',
          'update_linode_ip_address',
          'upgrade_linode',
          'view_linode_backup',
          'view_linode_config_profile_interface',
          'view_linode_config_profile',
          'view_linode_disk',
          'view_linode_ip_address',
          'view_linode_kernel',
          'view_linode_monthly_network_transfer_stats',
          'view_linode_monthly_stats',
          'view_linode_network_transfer',
          'view_linode_networking_info',
          'view_linode_stats',
          'view_linode_type',
          'view_linode',
        ],
        creator: [
          'allocate_ip',
          'assign_ips',
          'assign_ipv4',
          'create_ipv6_range',
          'create_linode',
          'list_linodes',
          'share_ips',
          'share_ipv4',
        ],
      }) as IamAccess,
      createResourceRoles('firewall', {
        accountAdmin: [
          'create_firewall_device',
          'create_firewall',
          'delete_firewall_device',
          'delete_firewall',
          'list_firewall_devices',
          'list_firewalls',
          'update_firewall_rules',
          'update_firewall',
          'view_firewall_device',
          'view_firewall',
        ],
        creator: ['create_firewall', 'list_firewalls'],
      }) as IamAccess,
      createResourceRoles('image', {
        accountAdmin: [
          'create_image',
          'delete_image',
          'list_images',
          'update_image',
          'upload_image',
          'view_image',
        ],
        creator: ['create_image', 'upload_image', 'list_images'],
      }) as IamAccess,
      createResourceRoles('vpc', {
        accountAdmin: [
          'create_vpc_subnet',
          'create_vpc',
          'delete_vpc_subnet',
          'delete_vpc',
          'list_all_vpc_ipaddresses',
          'list_vpc_ip_addresses',
          'list_vpc_subnets',
          'list_vpcs',
          'update_vpc_subnet',
          'update_vpc',
          'view_vpc_subnet',
          'view_vpc',
        ],
        creator: ['create_vpc', 'list_vpcs', 'list_all_vpc_ipaddresses'],
      }) as IamAccess,
      createResourceRoles('volume', {
        accountAdmin: [
          'attach_volume',
          'clone_volume',
          'create_volume',
          'delete_volume',
          'detach_volume',
          'list_volumes',
          'resize_volume',
          'update_volume',
          'view_volume',
        ],
        creator: ['create_volume', 'list_volumes'],
      }) as IamAccess,
      createResourceRoles('nodebalancer', {
        accountAdmin: [
          'add_nodebalancer_config_node',
          'add_nodebalancer_config',
          'create_nodebalancer',
          'delete_nodebalancer_config_node',
          'delete_nodebalancer_config',
          'delete_nodebalancer',
          'list_nodebalancer_config_nodes',
          'list_nodebalancer_configs',
          'list_nodebalancer_firewalls',
          'list_nodebalancers',
          'rebuild_nodebalancer_config',
          'update_nodebalancer_config_node',
          'update_nodebalancer_config',
          'update_nodebalancer',
          'view_nodebalancer_config_node',
          'view_nodebalancer_config',
          'view_nodebalancer_statistics',
          'view_nodebalancer',
        ],
        creator: ['create_nodebalancer', 'list_nodebalancers'],
      }) as IamAccess,
    ],
    entity_access: [
      createResourceRoles('linode', {
        admin: [
          'allocate_ip',
          'allocate_linode_ip_address',
          'assign_ips',
          'assign_ipv4',
          'boot_linode',
          'cancel_linode_backups',
          'clone_linode_disk',
          'clone_linode',
          'create_ipv6_range',
          'create_linode_backup_snapshot',
          'create_linode_config_profile_interface',
          'create_linode_config_profile',
          'create_linode_disk',
          'create_linode',
          'delete_linode_config_profile_interface',
          'delete_linode_config_profile',
          'delete_linode_disk',
          'delete_linode_ip_address',
          'delete_linode',
          'enable_linode_backups',
          'list_linode_backups',
          'list_linode_config_profile_interfaces',
          'list_linode_config_profiles',
          'list_linode_disks',
          'list_linode_firewalls',
          'list_linode_kernels',
          'list_linode_nodebalancers',
          'list_linode_types',
          'list_linode_volumes',
          'list_linodes',
          'migrate_linode',
          'password_reset_linode',
          'reboot_linode',
          'rebuild_linode',
          'reorder_linode_config_profile_interfaces',
          'rescue_linode',
          'reset_linode_disk_root_password',
          'resize_linode_disk',
          'resize_linode',
          'restore_linode_backup',
          'share_ips',
          'share_ipv4',
          'shutdown_linode',
          'update_linode_config_profile_interface',
          'update_linode_config_profile',
          'update_linode_disk',
          'update_linode_ip_address',
          'upgrade_linode',
          'view_linode_backup',
          'view_linode_config_profile_interface',
          'view_linode_config_profile',
          'view_linode_disk',
          'view_linode_ip_address',
          'view_linode_kernel',
          'view_linode_monthly_network_transfer_stats',
          'view_linode_monthly_stats',
          'view_linode_network_transfer',
          'view_linode_networking_info',
          'view_linode_stats',
          'view_linode_type',
          'view_linode',
        ],
        contributor: [
          'allocate_linode_ip_address',
          'boot_linode',
          'cancel_linode_backups',
          'clone_linode_disk',
          'clone_linode',
          'create_linode_backup_snapshot',
          'create_linode_config_profile_interface',
          'create_linode_config_profile',
          'create_linode_disk',
          'enable_linode_backups',
          'list_linode_backups',
          'list_linode_config_profile_interfaces',
          'list_linode_config_profiles',
          'list_linode_disks',
          'list_linode_firewalls',
          'list_linode_kernels',
          'list_linode_nodebalancers',
          'list_linode_types',
          'list_linode_volumes',
          'migrate_linode',
          'password_reset_linode',
          'reboot_linode',
          'rebuild_linode',
          'reorder_linode_config_profile_interfaces',
          'rescue_linode',
          'reset_linode_disk_root_password',
          'resize_linode_disk',
          'resize_linode',
          'restore_linode_backup',
          'shutdown_linode',
          'update_linode_config_profile_interface',
          'update_linode_config_profile',
          'update_linode_disk',
          'update_linode_ip_address',
          'upgrade_linode',
          'view_linode_backup',
          'view_linode_config_profile_interface',
          'view_linode_config_profile',
          'view_linode_disk',
          'view_linode_ip_address',
          'view_linode_kernel',
          'view_linode_monthly_network_transfer_stats',
          'view_linode_monthly_stats',
          'view_linode_network_transfer',
          'view_linode_networking_info',
          'view_linode_stats',
          'view_linode_type',
          'view_linode',
        ],
        viewer: [
          'list_linode_backups',
          'list_linode_config_profile_interfaces',
          'list_linode_config_profiles',
          'list_linode_disks',
          'list_linode_firewalls',
          'list_linode_kernels',
          'list_linode_nodebalancers',
          'list_linode_types',
          'list_linode_volumes',
          'view_linode_backup',
          'view_linode_config_profile_interface',
          'view_linode_config_profile',
          'view_linode_disk',
          'view_linode_ip_address',
          'view_linode_kernel',
          'view_linode_monthly_network_transfer_stats',
          'view_linode_monthly_stats',
          'view_linode_network_transfer',
          'view_linode_networking_info',
          'view_linode_stats',
          'view_linode_type',
          'view_linode',
        ],
      }) as IamAccess,
      createResourceRoles('image', {
        admin: [
          'create_image',
          'delete_image',
          'list_images',
          'update_image',
          'upload_image',
          'view_image',
        ],
        contributor: ['view_image', 'update_image'],
        viewer: ['view_image'],
      }) as IamAccess,
      createResourceRoles('vpc', {
        admin: [
          'create_vpc_subnet',
          'create_vpc',
          'delete_vpc_subnet',
          'delete_vpc',
          'list_all_vpc_ipaddresses',
          'list_vpc_ip_addresses',
          'list_vpc_subnets',
          'list_vpcs',
          'update_vpc_subnet',
          'update_vpc',
          'view_vpc_subnet',
          'view_vpc',
        ],
        contributor: [
          'create_vpc_subnet',
          'delete_vpc_subnet',
          'delete_vpc',
          'list_vpc_ip_addresses',
          'list_vpc_subnets',
          'update_vpc_subnet',
          'update_vpc',
          'view_vpc_subnet',
          'view_vpc',
        ],
        viewer: [
          'list_vpc_ip_addresses',
          'list_vpc_subnets',
          'view_vpc_subnet',
          'view_vpc',
        ],
      }) as IamAccess,
      createResourceRoles('volume', {
        admin: [
          'attach_volume',
          'clone_volume',
          'delete_volume',
          'detach_volume',
          'resize_volume',
          'update_volume',
          'view_volume',
        ],
        contributor: [
          'attach_volume',
          'clone_volume',
          'detach_volume',
          'resize_volume',
          'update_volume',
          'view_volume',
        ],
        viewer: ['view_volume'],
      }) as IamAccess,
      createResourceRoles('firewall', {
        admin: ['create_firewall', 'update_firewall', 'view_firewall'],
        contributor: ['view_firewall', 'update_firewall'],
        viewer: ['view_firewall'],
      }) as IamAccess,
      createResourceRoles('nodebalancer', {
        admin: [
          'add_nodebalancer_config_node',
          'add_nodebalancer_config',
          'delete_nodebalancer_config_node',
          'delete_nodebalancer_config',
          'delete_nodebalancer',
          'list_nodebalancer_config_nodes',
          'list_nodebalancer_configs',
          'list_nodebalancer_firewalls',
          'rebuild_nodebalancer_config',
          'update_nodebalancer_config_node',
          'update_nodebalancer_config',
          'update_nodebalancer',
          'view_nodebalancer_config_node',
          'view_nodebalancer_config',
          'view_nodebalancer_statistics',
          'view_nodebalancer',
        ],
        contributor: [
          'add_nodebalancer_config_node',
          'add_nodebalancer_config',
          'list_nodebalancer_config_nodes',
          'list_nodebalancer_configs',
          'list_nodebalancer_firewalls',
          'rebuild_nodebalancer_config',
          'update_nodebalancer_config_node',
          'update_nodebalancer_config',
          'update_nodebalancer',
          'view_nodebalancer_config_node',
          'view_nodebalancer_config',
          'view_nodebalancer_statistics',
          'view_nodebalancer',
        ],
        viewer: [
          'list_nodebalancer_config_nodes',
          'list_nodebalancer_configs',
          'list_nodebalancer_firewalls',
          'view_nodebalancer_config_node',
          'view_nodebalancer_config',
          'view_nodebalancer_statistics',
          'view_nodebalancer',
        ],
      }) as IamAccess,
    ],
  }
);
