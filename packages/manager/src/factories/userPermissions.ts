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
    entity_access: [
      {
        id: 10,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 1,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 2,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 3,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 4,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 5,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 6,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 7,
        type: 'linode',
        roles: ['linode_contributor', 'linode_viewer'],
      },
      {
        id: 8,
        type: 'linode',
        roles: ['linode_contributor'],
      },
      {
        id: 1,
        type: 'firewall',
        roles: ['firewall_admin'],
      },
    ],
  }
);
