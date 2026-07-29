import { screen } from '@testing-library/react';
import * as React from 'react';

import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../../../Shared/constants';
import { getCdsButtonByText } from '../../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../../utilities/testHelpers';
import { IdpConfigurationsLanding } from './IdpConfigurationsLanding';

const mockIdpConfig = {
  id: 'config-id',
  label: 'Test Config',
  created: '2024-01-01T00:00:00.000Z',
  created_by: 'user',
  updated: '2024-01-01T00:00:00.000Z',
  updated_by: 'user',
  enabled: true,
  enforce: false,
  default: false,
  excluded_users_count: 0,
  included_users_count: 0,
  saml: {
    entity_id: 'test-entity-id',
    identity_element: 'name_id',
    idp_url: 'https://idp.example.com',
    public_certificates: [
      {
        id: 'cert-id',
        certificate: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ123456',
        created: '2024-01-01T00:00:00.000Z',
        created_by: 'user',
        not_after: new Date(
          Date.now() + 200 * 24 * 60 * 60 * 1000
        ).toISOString(),
        not_before: new Date(
          Date.now() - 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ],
  },
};

const queryMocks = vi.hoisted(() => ({
  useGetIdpConfigsQuery: vi.fn().mockReturnValue({}),
  usePermissions: vi.fn().mockReturnValue({}),
  useProfile: vi.fn().mockReturnValue({ data: { timezone: 'UTC' } }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetIdpConfigsQuery: queryMocks.useGetIdpConfigsQuery,
    useProfile: queryMocks.useProfile,
  };
});

vi.mock('../../../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../../../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

describe('IdpConfigurationsLanding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia();
    queryMocks.usePermissions.mockReturnValue({
      data: { create_idp_config: true },
      error: null,
    });
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { results: 0 },
      error: null,
      isLoading: false,
    });
    queryMocks.useProfile.mockReturnValue({ data: { timezone: 'UTC' } });
  });

  it('renders an error state when the IDP configurations request fails', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
      status: 'error',
    });

    renderWithProviders(<IdpConfigurationsLanding />);

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

    renderWithProviders(<IdpConfigurationsLanding />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders IDP configurations when a configuration exists', async () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: {
        results: 1,
        data: [mockIdpConfig],
      },
      error: null,
      isLoading: false,
    });

    const { container } = renderWithProviders(<IdpConfigurationsLanding />);

    expect(
      await getCdsButtonByText(container, 'Edit IDP Configuration')
    ).toBeVisible();
    expect(screen.queryByText('No data to display')).not.toBeInTheDocument();
  });

  it('renders the empty state with an enabled create button for account admins', async () => {
    const { container } = renderWithProviders(<IdpConfigurationsLanding />);

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
      data: { create_idp_config: false },
      error: null,
    });

    const { container } = renderWithProviders(<IdpConfigurationsLanding />);

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );

    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });
});
