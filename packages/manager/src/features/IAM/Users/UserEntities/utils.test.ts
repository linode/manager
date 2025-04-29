import { userPermissionsFactory } from 'src/factories/userPermissions';

import { getEntityTypes } from './utils';
import { addEntityNamesToRoles } from './utils';

import type { EntitiesRole } from '../../Shared/types';
import type { AccountEntity, EntityType } from '@linode/api-v4';

const mockGoupedEntities: Map<
  EntityType,
  Pick<AccountEntity, 'id' | 'label'>[]
> = new Map([
  [
    'linode',
    [
      { id: 1, label: 'test 1' },
      { id: 2, label: 'test 2' },
    ],
  ],
]);

describe('getEntityTypes', () => {
  it('should call mapEntityTypes with the correct arguments', () => {
    const mockData: EntitiesRole[] = [
      {
        access: 'entity_access',
        entity_id: 1,
        entity_name: 'test 1',
        entity_type: 'linode',
        id: 'linode_contributor-1',
        role_name: 'linode_contributor',
      },
    ];

    const result = getEntityTypes(mockData);

    expect(result).toEqual([
      {
        label: 'Linodes',
        rawValue: 'linode',
        value: 'Linodes',
      },
    ]);
  });
});

describe('addEntityNamesToRoles', () => {
  it('should map entity names to roles correctly', () => {
    const assignedRoles = userPermissionsFactory.build({
      account_access: ['account_linode_admin', 'account_admin'],
      entity_access: [
        {
          id: 1,
          roles: ['linode_contributor'],
          type: 'linode',
        },
      ],
    });

    const result = addEntityNamesToRoles(assignedRoles, mockGoupedEntities);

    expect(result).toEqual([
      {
        access: 'entity_access',
        entity_id: 1,
        entity_name: 'test 1',
        entity_type: 'linode',
        id: 'linode_contributor-1',
        role_name: 'linode_contributor',
      },
    ]);
  });

  it('should return an empty array if no matching entities are found', () => {
    const assignedRoles = userPermissionsFactory.build({
      account_access: ['account_linode_admin', 'account_admin'],
      entity_access: [],
    });

    const result = addEntityNamesToRoles(assignedRoles, mockGoupedEntities);

    expect(result).toEqual([]);
  });
});
