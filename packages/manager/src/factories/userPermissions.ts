import { Factory } from '@linode/utilities';

import type { IamUserPermissions } from '@linode/api-v4';

export const userPermissionsFactory = Factory.Sync.makeFactory<IamUserPermissions>(
  {
    account_access: [
      'account_linode_admin',
      'linode_creator',
      'firewall_creator',
      'account_admin',
      'account_viewer',
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
        resource_id: 1,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 2,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 3,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 4,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 5,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 6,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 7,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 8,
        resource_type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        resource_id: 45678901,
        resource_type: 'firewall',
        roles: ['update_firewall'],
      },
    ],
  }
);
