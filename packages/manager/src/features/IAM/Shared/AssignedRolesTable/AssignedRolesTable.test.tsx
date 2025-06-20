import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedRolesTable } from './AssignedRolesTable';

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

const mockEntities = [
  accountEntityFactory.build({
    id: 7,
    type: 'linode',
  }),
  accountEntityFactory.build({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
  }),
];

describe('AssignedRolesTable', () => {
  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {},
    });

    renderWithTheme(<AssignedRolesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
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

    renderWithTheme(<AssignedRolesTable />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Unassign Role')).toBeVisible();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedRolesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'NonExistentRole');

    await waitFor(() => {
      expect(screen.getByText('No items to display.')).toBeVisible();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedRolesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'account_linode_admin');

    await waitFor(() => {
      expect(screen.queryByText('account_linode_admin')).toBeVisible();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedRolesTable />);

    const autocomplete = screen.getByPlaceholderText('All Assigned Roles');
    await userEvent.type(autocomplete, 'Firewall Roles');

    await waitFor(() => {
      expect(screen.queryByText('firewall_creator')).toBeVisible();
    });
  });
});
