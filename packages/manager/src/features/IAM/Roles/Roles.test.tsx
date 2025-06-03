import { screen } from '@testing-library/react';
import React from 'react';

import { accountPermissionsFactory } from 'src/factories/accountPermissions';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { RolesLanding } from './Roles';

const queryMocks = vi.hoisted(() => ({
  useAccountPermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/iam/iam', async () => {
  const actual = await vi.importActual('src/queries/iam/iam');
  return {
    ...actual,
    useAccountPermissions: queryMocks.useAccountPermissions,
  };
});

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual('src/features/IAM/Shared/utilities');
  return {
    ...actual,
    mapAccountPermissionsToRoles: vi.fn(),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('RolesLanding', () => {
  it('renders loading state when permissions are loading', async () => {
    queryMocks.useAccountPermissions.mockReturnValue({
      data: null,
      isLoading: true,
    });

    await renderWithThemeAndRouter(<RolesLanding />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders roles table when permissions are loaded', async () => {
    const mockPermissions = accountPermissionsFactory.build();
    queryMocks.useAccountPermissions.mockReturnValue({
      data: mockPermissions,
      isLoading: false,
    });

    await renderWithThemeAndRouter(<RolesLanding />);
    // RolesTable has a textbox at the top
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
