import { IamAccountPermissions } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

export const accountPermissionsFactory = Factory.Sync.makeFactory<IamAccountPermissions>(
  {
    account_access: [
      {
        resource_type: 'account',
        roles: [
          {
            name: 'account_admin',
            description:
              'Access to perform any supported action on all resources in the account',
            permissions: ['create_linode', 'update_linode', 'update_firewall'],
          },
        ],
      },
      {
        resource_type: 'linode',
        roles: [
          {
            name: 'account_linode_admin',
            description:
              'Access to perform any supported action on all linode instances in the account',
            permissions: ['create_linode', 'update_linode', 'delete_linode'],
          },
        ],
      },
      {
        resource_type: 'firewall',
        roles: [
          {
            name: 'firewall_creator',
            description: 'Access to create a firewall instance',
          },
        ],
      },
    ],
    resource_access: [
      {
        resource_type: 'linode',
        roles: [
          {
            name: 'linode_contributor',
            description: 'Access to update a linode instance',
            permissions: ['update_linode', 'view_linode'],
          },
        ],
      },
      {
        resource_type: 'firewall',
        roles: [
          {
            name: 'firewall_viewer',
            description: 'Access to view a firewall instance',
          },
          {
            name: 'firewall_admin',
            description:
              'Access to perform any supported action on a firewall instance',
          },
        ],
      },
    ],
  }
);
