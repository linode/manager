import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  ERROR_STATE_TEXT,
  NO_ASSIGNED_DEFAULT_ROLES_TEXT,
} from '../../Shared/constants';
import { DefaultRoles } from './DefaultRoles';

const loadingTestId = 'circle-progress';

const queryMocks = vi.hoisted(() => ({
  useGetDefaultDelegationAccessQuery: vi.fn().mockReturnValue({}),
  useLocation: vi.fn().mockReturnValue({}),
  useSearch: vi.fn().mockReturnValue({}),
  useNavigate: vi.fn(() => vi.fn()),
  useIsDefaultDelegationRolesForChildAccount: vi
    .fn()
    .mockReturnValue({ isDefaultDelegationRolesForChildAccount: true }),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useSearch: queryMocks.useSearch,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

vi.mock('src/features/IAM/hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));
describe('DefaultRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.usePermissions.mockReturnValue({
      data: { view_default_delegate_access: true },
      isLoading: false,
    });
  });
  it('should render', async () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: {
        account_access: [
          'account_linode_admin',
          'account_linode_creator',
          'account_firewall_creator',
        ],
        entity_access: [],
      },
      isLoading: false,
    });
    const { queryByTestId } = renderWithTheme(<DefaultRoles />);
    await waitForElementToBeRemoved(queryByTestId(loadingTestId));
    expect(screen.getByText('Default Roles for Delegate Users')).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
  });
  it('should render empty state', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/iam/roles/defaults/roles',
    });
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: { account_access: [], entity_access: [] },
      isLoading: false,
    });

    renderWithTheme(<DefaultRoles />);

    expect(screen.getByText(NO_ASSIGNED_DEFAULT_ROLES_TEXT)).toBeVisible();
    expect(screen.getByText('Add New Default Roles')).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(<DefaultRoles />);
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('should not render if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        view_default_delegate_access: false,
      },
      isLoading: false,
    });

    renderWithTheme(<DefaultRoles />);

    expect(
      screen.queryByText(
        'You do not have permission to view default roles for delegate users.'
      )
    ).toBeVisible();
  });
});
