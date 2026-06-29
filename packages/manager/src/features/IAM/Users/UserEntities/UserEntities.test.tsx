import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  createAccountEntity,
  createAccountRoles,
  createUserRoles,
} from '../../factories';
import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
  NO_ASSIGNED_ENTITIES_TEXT,
} from '../../Shared/constants';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { UserEntities } from './UserEntities';

const mockEntities = [
  createAccountEntity({
    id: 1,
    label: 'firewall-1',
    type: 'firewall',
  }),
];

const queryMocks = vi.hoisted(() => ({
  useAccountUser: vi.fn().mockReturnValue({ error: null }),
  useAllAccountEntities: vi.fn().mockReturnValue({}),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: false }),
  useParams: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useAccountRoles: vi.fn().mockReturnValue({}),
  useUserRoles: vi.fn().mockReturnValue({ isLoading: false }),
  usePermissions: vi.fn().mockReturnValue({}),
}));

beforeAll(() => mockMatchMedia());

vi.mock('src/features/IAM/hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));

vi.mock('@linode/queries', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@linode/queries')>();
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useAccountUser: queryMocks.useAccountUser,
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

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('UserEntities', () => {
  beforeEach(() => {
    queryMocks.useParams.mockReturnValue({
      username: 'test-user',
    });
    queryMocks.useSearch.mockReturnValue({
      selectedRole: '',
    });
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_entities: true,
      },
    });
  });

  it('should display no entities text if no entity roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: ['account_admin'],
        entity_access: [],
      }),
    });

    renderWithProviders(<UserEntities />);
    expect(screen.getByText('This list is empty')).toBeVisible();

    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();
    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display no entities text if no roles are assigned to user', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles({
        account_access: [],
        entity_access: [],
      }),
    });

    renderWithProviders(<UserEntities />);

    expect(screen.getByText('This list is empty')).toBeVisible();

    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();

    expect(screen.getByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeVisible();
  });

  it('should display entities and menu when data is available', async () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: createUserRoles(),
    });

    queryMocks.useAccountRoles.mockReturnValue({
      data: createAccountRoles(),
    });

    queryMocks.useAllAccountEntities.mockReturnValue({
      data: mockEntities,
    });

    renderWithProviders(<UserEntities />);

    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();
    expect(screen.getByText('firewall_admin')).toBeVisible();
    expect(screen.getByText('firewall-1')).toBeVisible();

    const actionMenuButton = screen.getAllByLabelText(
      'Action menu for entity firewall-1'
    )[0];
    expect(actionMenuButton).toBeVisible();

    await userEvent.click(actionMenuButton);
    expect(screen.getByTestId('Change Role')).toBeVisible();
    expect(screen.getByTestId('Remove Assignment')).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useUserRoles.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithProviders(<UserEntities />);
    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('should not render if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_entities: false,
        view_user: false,
        list_role_permissions: false,
      },
    });

    renderWithProviders(<UserEntities />);
    expect(screen.queryByText('This list is empty')).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Assign New Roles' })
    ).not.toBeInTheDocument();
    expect(screen.queryByText(NO_ASSIGNED_ENTITIES_TEXT)).toBeNull();
  });
});
