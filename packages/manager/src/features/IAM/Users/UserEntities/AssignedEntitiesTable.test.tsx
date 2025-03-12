import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { accountResourcesFactory } from 'src/factories/accountResources';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntitiesTable } from '../../Users/UserEntities/AssignedEntitiesTable';

const queryMocks = vi.hoisted(() => ({
  useAccountResources: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
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

describe('AssignedEntitiesTable', () => {
  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: {},
    });

    const { getByText } = renderWithTheme(<AssignedEntitiesTable />);

    getByText('No Entities are assigned.');
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getAllByLabelText, getByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    expect(getByText('firewall-us-123')).toBeInTheDocument();
    expect(getByText('Firewall')).toBeInTheDocument();
    expect(getByText('update_firewall')).toBeInTheDocument();

    const actionMenuButton = getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeInTheDocument();

    fireEvent.click(actionMenuButton);
    expect(getByText('Change Role')).toBeInTheDocument();
    expect(getByText('Remove Assignment')).toBeInTheDocument();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, getByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'NonExistentRole' } });

    await waitFor(() => {
      expect(getByText('No Entities are assigned.')).toBeInTheDocument();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, {
      target: { value: 'firewall-us-123' },
    });

    await waitFor(() => {
      expect(queryByText('firewall-us-123')).toBeInTheDocument();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountResources.mockReturnValue({
      data: accountResourcesFactory.build(),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    const autocomplete = getByPlaceholderText('All Assigned Entities');
    fireEvent.change(autocomplete, { target: { value: 'Firewalls' } });

    await waitFor(() => {
      expect(queryByText('firewall-us-123')).toBeInTheDocument();
    });
  });
});
