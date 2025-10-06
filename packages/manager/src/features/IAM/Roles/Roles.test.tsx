import { screen } from '@testing-library/react';
import React from 'react';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesLanding } from './Roles';

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
  };
});

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual('src/features/IAM/Shared/utilities');
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
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

    renderWithTheme(<RolesLanding />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders roles table when permissions are loaded', async () => {
    const mockPermissions = accountRolesFactory.build();
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: true,
      },
    });
    queryMocks.useAccountRoles.mockReturnValue({
      data: mockPermissions,
      isLoading: false,
    });

    renderWithTheme(<RolesLanding />);
    // RolesTable has a textbox at the top
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should show an error message if user does not have permissions', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: {
        is_account_admin: false,
      },
    });

    renderWithTheme(<RolesLanding />);
    expect(
      screen.getByText('You do not have permission to view roles.')
    ).toBeInTheDocument();
  });
});
