import { screen } from '@testing-library/react';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { mapAccountPermissionsToRoles } from 'src/features/IAM/Shared/utilities';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { RolesLanding } from './Roles';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual<any>('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
  };
});

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual<any>('src/features/IAM/Shared/utilities');
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesLanding', () => {
  it('renders loading state when permissions are loading', () => {
    queryMocks.useAccountPermissions.mockReturnValue({ data: null, isLoading: true });

    renderWithTheme(<RolesLanding />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders roles table when permissions are loaded', () => {
    const mockPermissions = accountPermissionsFactory.build();
    const mockRoles = [{ name: 'Admin', access: 'full_access', description: 'Administrator role', permissions: [] }];
    queryMocks.useAccountPermissions.mockReturnValue({ data: mockPermissions, isLoading: false });
    mapAccountPermissionsToRoles(mockRoles);

    renderWithTheme(<RolesLanding />);

    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders empty roles table when no permissions are available', () => {
    queryMocks.useAccountPermissions.mockReturnValue({ data: [], isLoading: false });
    mapAccountPermissionsToRoles([]);

    renderWithTheme(<RolesLanding />);

    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('renders error message when permissions fetch fails', () => {
    queryMocks.useAccountPermissions.mockReturnValue({ data: null, isLoading: false, error: true });

    renderWithTheme(<RolesLanding />);

    expect(screen.getByText('Error loading roles')).toBeInTheDocument();
  });
});
