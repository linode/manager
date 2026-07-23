import { screen } from '@testing-library/react';
import React from 'react';

import { createAccountRoles } from '../factories';
import {
  expectNotificationBannerText,
  mockMatchMedia,
  renderWithProviders,
} from '../utilities/testHelpers';
import { RolesLanding } from './Roles';

const DEFAULT_ROLES_PANEL_TEXT = 'Default Roles for Delegate Users';

beforeAll(() => mockMatchMedia());

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('../Shared/utilities', async () => {
  const actual = await vi.importActual('../Shared/utilities');
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

vi.mock('../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesLanding', () => {
  it('renders loading state when permissions are loading', async () => {
    queryMocks.useAccountRoles.mockReturnValue({
      data: null,
      isLoading: true,
    });

    renderWithProviders(<RolesLanding />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('renders roles table when permissions are loaded', async () => {
    const mockPermissions = createAccountRoles();
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_role_permissions: true,
      },
    });
    queryMocks.useAccountRoles.mockReturnValue({
      data: mockPermissions,
      isLoading: false,
    });

    const { container } = renderWithProviders(<RolesLanding />);
    expect(container.querySelector('cds-search-field')).toBeVisible();
  });

  it('should show an error message if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_role_permissions: false,
      },
    });

    renderWithProviders(<RolesLanding />);

    return expectNotificationBannerText(
      'You do not have permission to view roles.'
    );
  });

  it('should not show the default roles panel for non-child accounts', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_role_permissions: true,
      },
    });
    queryMocks.useProfile.mockReturnValue({ data: { user_type: 'parent' } });

    renderWithProviders(<RolesLanding />);
    expect(
      screen.queryByText(DEFAULT_ROLES_PANEL_TEXT)
    ).not.toBeInTheDocument();
  });

  it('should show the default roles panel for child accounts', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        list_role_permissions: true,
      },
    });
    queryMocks.useProfile.mockReturnValue({ data: { user_type: 'child' } });

    renderWithProviders(<RolesLanding />, {
      flags: {
        iam: { enabled: true },
      },
    });
    expect(screen.getByText(DEFAULT_ROLES_PANEL_TEXT)).toBeVisible();
  });
});
