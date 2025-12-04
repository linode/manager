import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { userRolesFactory } from 'src/factories/userRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedEntitiesTable } from '../../Shared/AssignedEntitiesTable/AssignedEntitiesTable';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual('src/queries/entities/entities');
  return {
    ...actual,
    useAllAccountEntities: queryMocks.useAllAccountEntities,
  };
});

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useParams: queryMocks.useParams,
    useSearch: queryMocks.useSearch,
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
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
    queryMocks.useSearch.mockReturnValue({
      query: '',
    });
  });

  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: {},
    });

    renderWithTheme(<AssignedEntitiesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedEntitiesTable />);

    expect(screen.getByText('no_devices')).toBeVisible();
    expect(screen.getByText('Firewall')).toBeVisible();
    expect(screen.getByText('firewall_admin')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for entity no_devices'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Remove Assignment')).toBeVisible();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'NonExistentRole');

    await waitFor(() => {
      expect(screen.getByText('No items to display.')).toBeVisible();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'no_devices');

    await waitFor(() => {
      expect(screen.queryByText('no_devices')).toBeVisible();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: userRolesFactory.build(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedEntitiesTable />);

    const autocomplete = screen.getByPlaceholderText('All Entities');
    await userEvent.type(autocomplete, 'Firewalls');

    await waitFor(() => {
      expect(screen.queryByText('no_devices')).toBeVisible();
    });
  });
});
