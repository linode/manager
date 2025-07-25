import { userRolesFactory } from 'src/factories/userRoles';

import { addEntityNamesToRoles } from './utils';

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

describe('addEntityNamesToRoles', () => {
  it('should map entity names to roles correctly', () => {
    const assignedRoles = userRolesFactory.build({
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
    const assignedRoles = userRolesFactory.build({
      account_access: ['account_linode_admin', 'account_admin'],
      entity_access: [],
    });

    const result = addEntityNamesToRoles(assignedRoles, mockGoupedEntities);

    expect(result).toEqual([]);
  });
});
