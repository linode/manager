import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { userPermissionsFactory } from 'src/factories/userPermissions';
import { makeResourcePage } from 'src/mocks/serverHandlers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntitiesTable } from '../../Users/UserEntities/AssignedEntitiesTable';

const queryMocks = vi.hoisted(() => ({
  useAccountEntities: vi.fn().mockReturnValue({}),
  useAccountUserPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
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
    id: 1,
    label: 'no_devices',
    type: 'firewall',
  }),
];

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

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    const { getAllByLabelText, getByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    expect(getByText('no_devices')).toBeInTheDocument();
    expect(getByText('Firewall')).toBeInTheDocument();
    expect(getByText('firewall_admin')).toBeInTheDocument();

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

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
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

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    const searchInput = getByPlaceholderText('Search');
    fireEvent.change(searchInput, {
      target: { value: 'no_devices' },
    });

    await waitFor(() => {
      expect(queryByText('no_devices')).toBeInTheDocument();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    const { getByPlaceholderText, queryByText } = renderWithTheme(
      <AssignedEntitiesTable />
    );

    const autocomplete = getByPlaceholderText('All Assigned Entities');
    fireEvent.change(autocomplete, { target: { value: 'Firewalls' } });

    await waitFor(() => {
      expect(queryByText('no_devices')).toBeInTheDocument();
    });
  });
});
