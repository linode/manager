import { screen } from '@testing-library/react';
import React from 'react';

import { accountRolesFactory } from 'src/factories/accountRoles';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { RolesLanding } from './Roles';

const queryMocks = vi.hoisted(() => ({
  useAccountRoles: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual<any>('@linode/queries');
  return {
    ...actual,
    useAccountRoles: queryMocks.useAccountRoles,
  };
});

vi.mock('src/features/IAM/Shared/utilities', async () => {
  const actual = await vi.importActual<any>(
    'src/features/IAM/Shared/utilities'
  );
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
    queryMocks.useAccountRoles.mockReturnValue({
      data: null,
      isLoading: true,
    });

    await renderWithThemeAndRouter(<RolesLanding />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders roles table when permissions are loaded', async () => {
    const mockPermissions = accountRolesFactory.build();
    queryMocks.useAccountRoles.mockReturnValue({
      data: mockPermissions,
      isLoading: false,
    });

    await renderWithThemeAndRouter(<RolesLanding />);
    // RolesTable has a textbox at the top
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
