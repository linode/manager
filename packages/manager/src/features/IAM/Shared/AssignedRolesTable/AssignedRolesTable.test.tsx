import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createAccountEntity,
  createAccountRoles,
  createUserRoles,
} from '../../factories';
import { getCdsButtonByText } from '../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { AssignedRolesTable } from './AssignedRolesTable';

const queryMocks = vi.hoisted(() => ({
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useParams: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({}),
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi.fn().mockReturnValue({
    isDefaultDelegationRolesForChildAccount: false,
  }),
  usePermissions: vi.fn().mockReturnValue({
    data: { is_account_admin: true, update_default_delegate_access: true },
  }),
}));

beforeAll(() => mockMatchMedia());

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useUserRoles: queryMocks.useUserRoles,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

vi.mock('../../queries/entities/entities', async () => {
  const actual = await vi.importActual('../../queries/entities/entities');
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
    useNavigate: queryMocks.useNavigate,
    useSearch: queryMocks.useSearch,
  };
});

vi.mock('../../hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

const mockEntities = [
  createAccountEntity({
    id: 7,
    type: 'linode',
  }),
  createAccountEntity({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
  }),
];

const mockUserRoles = createUserRoles();
const mockAccountRoles = createAccountRoles();

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

    renderWithProviders(<AssignedRolesTable />);

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

    renderWithProviders(<AssignedRolesTable />);

    expect(screen.getByText('account_linode_admin')).toBeVisible();
    expect(screen.getAllByText('All Linodes')[0]).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for role account_linode_admin'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getAllByTestId('Change Role')[0]).toBeVisible();
    expect(screen.getAllByTestId('Unassign Role')[0]).toBeVisible();
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

    queryMocks.useSearch.mockReturnValue({ query: 'NonExistentRole' });

    renderWithProviders(<AssignedRolesTable />);

    expect(screen.getByText('No items to display.')).toBeVisible();
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

    queryMocks.useSearch.mockReturnValue({ query: 'account_linode_admin' });

    renderWithProviders(<AssignedRolesTable />);

    await waitFor(() => {
      expect(screen.getByText('account_linode_admin')).toBeVisible();
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

    queryMocks.useSearch.mockReturnValue({ roleType: 'firewall' });

    renderWithProviders(<AssignedRolesTable />);

    await waitFor(() => {
      expect(screen.getByText('account_firewall_creator')).toBeVisible();
    });
  });

  it('should show different button text for default roles view', async () => {
    queryMocks.useIsDefaultDelegationRolesForChildAccount.mockReturnValue({
      isDefaultDelegationRolesForChildAccount: true,
    });

    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: mockUserRoles,
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: mockAccountRoles,
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    const { container } = renderWithProviders(<AssignedRolesTable />);

    expect(
      await getCdsButtonByText(container, 'Add New Default Roles')
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();
  });
});
