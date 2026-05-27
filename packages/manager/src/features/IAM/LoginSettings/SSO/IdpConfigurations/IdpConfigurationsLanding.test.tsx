import { screen } from '@testing-library/react';
import * as React from 'react';

import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
} from 'src/features/IAM/Shared/constants';
import { getCdsButtonByText } from 'src/features/IAM/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { IdpConfigurationsLanding } from './IdpConfigurationsLanding';

const queryMocks = vi.hoisted(() => ({
  useGetIdpConfigsQuery: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetIdpConfigsQuery: queryMocks.useGetIdpConfigsQuery,
  };
});

vi.mock('src/features/IAM/hooks/usePermissions', async () => {
  const actual = await vi.importActual('src/features/IAM/hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('IdpConfigurationsLanding', () => {
  beforeEach(() => {
    queryMocks.usePermissions.mockReturnValue({
      data: { is_account_admin: true },
      error: null,
    });
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { results: 0 },
      error: null,
      isLoading: false,
    });
  });

  it('renders an error state when the IDP configurations request fails', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(<IdpConfigurationsLanding />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders an error state when the permissions request fails', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithTheme(<IdpConfigurationsLanding />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders IDP configurations when a configuration exists', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { results: 1 },
      error: null,
      isLoading: false,
    });

    renderWithTheme(<IdpConfigurationsLanding />);

    expect(screen.getByText('IDP Configurations')).toBeVisible();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });

  it('renders the empty state with an enabled create button for account admins', async () => {
    const { container } = renderWithTheme(<IdpConfigurationsLanding />);

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );
    expect(createButton).toBeVisible();
    expect(createButton).toBeEnabled();

    expect(screen.getByText('No data to display')).toBeVisible();
    expect(
      screen.getByText(/Once you create the IDP configuration/i)
    ).toBeVisible();
  });

  it('disables the create button when the user is not an account admin', async () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { is_account_admin: false },
      error: null,
    });

    const { container } = renderWithTheme(<IdpConfigurationsLanding />);

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );

    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });
});
