import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountEntityFactory } from 'src/factories/accountEntities';
import { accountRolesFactory } from 'src/factories/accountRoles';
import { userRolesFactory } from 'src/factories/userRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { AssignedRolesTable } from './AssignedRolesTable';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
  };
});

vi.mock('src/queries/entities/entities', async () => {
  const actual = await vi.importActual<any>('src/queries/entities/entities');
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

const mockUserRoles = userRolesFactory.build();
const mockAccountRoles = accountRolesFactory.build();

describe('AssignedRolesTable', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test_user',
    });
  });

  it('should display no roles text if there are no roles assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: {},
    });

    renderWithTheme(<AssignedRolesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
  });

  it('should display roles and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: mockUserRoles,
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedRolesTable />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for role account_linode_admin'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByText('Change Role')).toBeVisible();
    expect(screen.getByText('Unassign Role')).toBeVisible();
  });

  it('should display empty state when no roles match filters', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: mockUserRoles,
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedRolesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'NonExistentRole');

    await waitFor(() => {
      expect(screen.getByText('No items to display.')).toBeVisible();
    });
  });

  it('should filter roles based on search query', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: mockUserRoles,
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedRolesTable />);

    const searchInput = screen.getByPlaceholderText('Search');
    await userEvent.type(searchInput, 'account_linode_admin');

    await waitFor(() => {
      expect(screen.queryByText('account_linode_admin')).toBeVisible();
    });
  });

  it('should filter roles based on selected resource type', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: mockUserRoles,
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedRolesTable />);

    const autocomplete = screen.getByPlaceholderText('All Assigned Roles');
    await userEvent.type(autocomplete, 'Firewall Roles');

    await waitFor(() => {
      expect(screen.queryByText('account_firewall_creator')).toBeVisible();
    });
  });

  it('should show different button text for default roles view', async () => {
    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithTheme(<AssignedRolesTable />);

    expect(screen.getByText('Add New Default Roles')).toBeVisible();
    expect(screen.queryByText('Assign New Roles')).not.toBeInTheDocument();
  });
});
