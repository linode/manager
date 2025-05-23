import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

    renderWithTheme(<AssignedEntitiesTable />);

    expect(screen.getByText('No Entities are assigned.')).toBeVisible();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedEntitiesTable />);

    expect(screen.getByText('no_devices')).toBeVisible();
    expect(screen.getByText('Firewall')).toBeVisible();
    expect(screen.getByText('firewall_admin')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText('action menu')[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Remove')).toBeVisible();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'NonExistentRole');

    await waitFor(() => {
      expect(screen.getByText('No Entities are assigned.')).toBeVisible();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'no_devices');

    await waitFor(() => {
      expect(screen.queryByText('no_devices')).toBeVisible();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useAccountUserPermissions.mockReturnValue({
      data: userPermissionsFactory.build(),
    });

    queryMocks.useAccountEntities.mockReturnValue({
      data: makeResourcePage(mockEntities),
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const autocomplete = screen.getByPlaceholderText('All Entities');
    await userEvent.type(autocomplete, 'Firewalls');

    await waitFor(() => {
      expect(screen.queryByText('no_devices')).toBeVisible();
    });
  });
});
