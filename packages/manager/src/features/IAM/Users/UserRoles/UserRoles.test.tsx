import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NO_ASSIGNED_ROLES_TEXT } from '../../Shared/constants';
import { UserRoles } from './UserRoles';

const mockEntities = [
  accountEntityFactory.build({
    id: 7,
    type: 'linode',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
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

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual<any>('src/queries/entities/entities');
  return {
    ...actual,
    useAccountEntities: queryMocks.useAccountEntities,
  };
});

describe('UserRoles', () => {
  it('should display no roles text if no roles are assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [],
      }),
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('This list is empty')).toBeVisible();
    expect(screen.getByText(NO_ASSIGNED_ROLES_TEXT)).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Assign New Roles' })
    ).toBeVisible();
  });

  it('should display table if no entity access roles are assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<UserRoles />);

    expect(
      screen.getByText('View and manage roles assigned to the user.')
    ).toBeVisible();

    expect(screen.getByText(/All Entities/i)).toBeVisible();
    expect(screen.getByText('account_admin')).toBeVisible();
  });

  it('should display table if no account access roles are assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build({
        account_access: [],
        entity_access: [
          {
            id: 1,
            roles: ['firewall_admin'],
            type: 'firewall',
          },
        ],
      }),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('firewall_admin')).toBeVisible();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<UserRoles />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Unassign Role')).toBeVisible();
  });
});
