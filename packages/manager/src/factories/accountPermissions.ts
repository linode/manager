import Factory from 'src/factories/factoryProxy';

import type { IamAccountPermissions } from '@linode/api-v4';

export const accountPermissionsFactory = Factory.Sync.makeFactory<IamAccountPermissions>(
  {
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
      {
        resource_type: 'firewall',
        roles: [
          {
            description: 'Access to create a firewall instance',
            name: 'firewall_creator',
            permissions: ['update_firewall'],
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
      {
        resource_type: 'firewall',
        roles: [
          {
            description: 'Access to view a firewall instance',
            name: 'firewall_viewer',
            permissions: ['update_firewall'],
          },
          {
            description:
              'Access to perform any supported action on a firewall instance',
            name: 'firewall_admin',
            permissions: ['update_firewall'],
          },
        ],
      },
    ],
  }
);
