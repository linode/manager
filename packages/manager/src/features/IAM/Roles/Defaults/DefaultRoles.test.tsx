import { screen } from '@testing-library/react';
import React from 'react';

import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
  NO_ASSIGNED_DEFAULT_ROLES_TEXT,
} from '../../Shared/constants';
import {
  expectNotificationBannerText,
  getCdsButtonByText,
} from '../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../utilities/testHelpers';
import { DefaultRoles } from './DefaultRoles';

vi.mock('../../Shared/AssignedRolesTable/AssignedRolesTable', () => ({
  AssignedRolesTable: () => <div>Role</div>,
}));

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
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetDefaultDelegationAccessQuery:
      queryMocks.useGetDefaultDelegationAccessQuery,
  };
});

vi.mock('../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

vi.mock('../../hooks/useDelegationRole', () => ({
  useIsDefaultDelegationRolesForChildAccount:
    queryMocks.useIsDefaultDelegationRolesForChildAccount,
}));
beforeAll(() => mockMatchMedia());

describe('DefaultRoles', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: true,
        update_default_delegate_access: true,
        view_default_delegate_access: true,
      },
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
    renderWithProviders(<DefaultRoles />);

    expect(screen.getByText('Default Roles for Delegate Users')).toBeVisible();
    expect(screen.getByText('Role')).toBeVisible();
  });
  it('should render empty state', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: '/iam/roles/defaults/roles',
    });
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: { account_access: [], entity_access: [] },
      isLoading: false,
    });

    const { container } = renderWithProviders(<DefaultRoles />);

    expect(screen.getByText(NO_ASSIGNED_DEFAULT_ROLES_TEXT)).toBeVisible();
    expect(
      await getCdsButtonByText(container, 'Add New Default Roles')
    ).toBeVisible();
  });

  it('should show error state when api fails', () => {
    queryMocks.useGetDefaultDelegationAccessQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithProviders(<DefaultRoles />);
    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('should not render if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        view_default_delegate_access: false,
      },
      isLoading: false,
    });

    renderWithProviders(<DefaultRoles />);

    return expectNotificationBannerText(
      'You do not have permission to view default roles for delegate users.'
    );
  });
});
