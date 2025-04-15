import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntities } from './AssignedEntities';

const mockEntities: string[] = ['linode-uk-123'];

const mockEntitiesLong: string[] = [
  'debian-us-123',
  'linode-uk-123',
  'debian-us-1',
  'linode-uk-1',
  'debian-us-2',
  'linode-uk-2',
  'debian-us-3',
  'linode-uk-3',
  'debian-us-4',
  'linode-uk-4',
];

const handleClick = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ username: 'test_user' }),
  };
});

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
    useAccountUserPermissions: queryMocks.useAccountUserPermissions,
  };
});

const mockDeleteUserRole = vi.fn();
vi.mock('@linode/api-v4', async () => {
  return {
    ...(await vi.importActual<any>('@linode/api-v4')),
    updateUserPermissions: (username: string, data: any) => {
      mockDeleteUserRole(data);
      return Promise.resolve();
    },
  };
});
describe('AssignedEntities', () => {
  it('renders the correct number of entity chips', () => {
    renderWithTheme(
      <AssignedEntities
        entities={mockEntities}
        entityIds={[1]}
        entityType="linode"
        onButtonClick={handleClick}
        roleName="linode_viewer"
      />
    );

    const chips = screen.getAllByTestId('entities');
    expect(chips).toHaveLength(1);

    expect(screen.getByText(mockEntities[0])).toBeVisible();
  });

  it('renders the correct number of entity chips', () => {
    renderWithTheme(
      <AssignedEntities
        entities={mockEntitiesLong}
        entityIds={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
        entityType="linode"
        onButtonClick={handleClick}
        roleName="linode_viewer"
      />
    );

    const chips = screen.getAllByTestId('entities');
    expect(chips).toHaveLength(mockEntitiesLong.length);
  });

  it('calls handleDelete when the delete icon is clicked', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [
          {
            id: 1,
            type: 'linode',
            roles: ['linode_viewer'],
          },
        ],
      },
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });
    renderWithTheme(
      <AssignedEntities
        entities={mockEntities}
        entityIds={[1]}
        entityType="linode"
        onButtonClick={handleClick}
        roleName="linode_viewer"
      />
    );
    const deleteIcons = screen.getAllByTestId('CloseIcon');
    expect(deleteIcons).toHaveLength(1);

    // Simulate clicking the delete icon
    await userEvent.click(deleteIcons[0]);

    await waitFor(() => {
      expect(mockDeleteUserRole).toHaveBeenCalledWith({
        account_access: ['account_linode_admin', 'account_admin'],
        entity_access: [],
      });
    });
  });
});
