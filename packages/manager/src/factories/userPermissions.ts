import Factory from 'src/factories/factoryProxy';

import type { IamUserPermissions } from '@linode/api-v4';

export const userPermissionsFactory = Factory.Sync.makeFactory<IamUserPermissions>(
  {
    account_access: [
      'account_linode_admin',
      'linode_creator',
      'firewall_creator',
      'account_admin',
    ],
    resource_access: [
      {
        resource_id: 12345678,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 23456789,
        resource_type: 'linode',
        roles: ['linode_contributor', 'linode_viewer'],
      },
      {
        resource_id: 45678901,
        resource_type: 'firewall',
        roles: ['update_firewall'],
      },
    ],
  }
);
