import { IamUserPermissions } from '@linode/api-v4';
import Factory from 'src/factories/factoryProxy';

export const userPermissionsFactory = Factory.Sync.makeFactory<IamUserPermissions>(
  {
    account_access: [
      'account_linode_admin',
      'linode_creator',
      'firewall_creator',
    ],
    resource_access: [
      {
        resource_id: 12345678,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 45678901,
        resource_type: 'firewall',
        roles: ['firewall_admin'],
      },
    ],
  }
);
