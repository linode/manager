import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { accountResourcesFactory } from 'src/factories/accountResources';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedRolesTable } from './AssignedRolesTable';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
  useAccountResources: vi.fn().mockReturnValue({}),
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

vi.mock('src/queries/resources/resources', async () => {
  const actual = await vi.importActual<any>('src/queries/resources/resources');
  return {
    ...actual,
    useAccountResources: queryMocks.useAccountResources,
  };
});

describe('AssignedRolesTable', () => {
  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {},
    });

    const { getByText } = renderWithTheme(<AssignedRolesTable />);

    getByText('No Roles are assigned.');
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getAllByLabelText, getAllByText, getByText } = renderWithTheme(
      <AssignedRolesTable />
    );

    expect(getByText('account_linode_admin')).toBeInTheDocument();
    expect(getAllByText('All Linodes')[0]).toBeInTheDocument();

    const actionMenuButton = getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeInTheDocument();

    fireEvent.click(actionMenuButton);
    expect(getByText('Change Role')).toBeInTheDocument();
    expect(getByText('Unassign Role')).toBeInTheDocument();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <AssignedRolesTable />
    );

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'NonExistentRole' } });

    await waitFor(() => {
      expect(getByText('No Roles are assigned.')).toBeInTheDocument();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedRolesTable />
    );

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, {
      target: { value: 'account_linode_admin' },
    });

    await waitFor(() => {
      expect(queryByText('account_linode_admin')).toBeInTheDocument();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountPermissions.mockReturnValue({
      data: accountPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedRolesTable />
    );

    const autocomplete = getByPlaceholderText('All Assigned Roles');
    fireEvent.change(autocomplete, { target: { value: 'Firewall Roles' } });

    await waitFor(() => {
      expect(queryByText('firewall_creator')).toBeInTheDocument();
    });
  });
});
