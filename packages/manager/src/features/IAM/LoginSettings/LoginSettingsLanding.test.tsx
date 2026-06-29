import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
} from 'src/features/IAM/Shared/constants';

import { renderWithProviders } from '../utilities/testHelpers';
import { LoginSettingsLanding } from './LoginSettingsLanding';

import type { IdpConfig } from '@linode/api-v4';

const mockNavigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useGetIdpConfigsQuery: vi.fn(),
  useNavigate: vi.fn(() => mockNavigate),
  usePermissions: vi.fn(),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetIdpConfigsQuery: queryMocks.useGetIdpConfigsQuery,
  };
});

vi.mock('../hooks/usePermissions', async () => {
  const actual = await vi.importActual('../hooks/usePermissions');
  return {
    ...actual,
    usePermissions: queryMocks.usePermissions,
  };
});

const makeIdpConfig = (overrides: Partial<IdpConfig> = {}): IdpConfig => ({
  created: '2024-01-01T00:00:00.000Z',
  created_by: 'user',
  default: true,
  enabled: false,
  enforce: false,
  excluded_users_count: 0,
  id: 'config-id',
  included_users_count: 0,
  label: 'Test IDP',
  saml: {
    entity_id: 'entity-id',
    identity_element: 'name_id',
    idp_url: 'https://idp.example.com',
    public_certificates: [],
  },
  updated: '2024-01-01T00:00:00.000Z',
  updated_by: 'user',
  ...overrides,
});

describe('LoginSettingsLanding', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { data: [], results: 0 },
      error: null,
      isLoading: false,
    });
    queryMocks.usePermissions.mockReturnValue({
      data: { view_idp_config: true },
      error: null,
    });
  });

  it('shows a no-permission banner when the user cannot view IDP configurations', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { view_idp_config: false },
      error: null,
    });

    const { container } = renderWithProviders(<LoginSettingsLanding />);

    expect(container.querySelector('cds-notification-banner')).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: 'Enforce Single Sign-On' })
    ).not.toBeInTheDocument();
  });

  it('shows an error state when the permissions request fails', () => {
    queryMocks.usePermissions.mockReturnValue({
      data: { view_idp_config: true },
      error: [{ reason: 'An unexpected error occurred' }],
    });

    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('shows an error state when IDP configs fail and permission is granted', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders the SSO enforcement landing content', () => {
    renderWithProviders(<LoginSettingsLanding />);

    expect(
      screen.getByRole('heading', { name: 'Enforce Single Sign-On' })
    ).toBeVisible();
    expect(
      screen.getByText(
        /Configure your identity provider \(IDP\), single sign-on \(SSO\) login requirements for your account, and users you want to exclude from SSO enforcement\./i
      )
    ).toBeVisible();
  });

  it('navigates to IDP configurations when manage is clicked', async () => {
    renderWithProviders(<LoginSettingsLanding />);

    await userEvent.click(screen.getByText('Manage SSO Enforcement'));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/iam/settings/sso/idp-configurations',
    });
  });

  it('shows disabled icon and not-configured text when there is no IDP config', () => {
    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByLabelText('Status is inactive')).toBeVisible();
    expect(
      screen.getByText('SSO is not configured for this account.')
    ).toBeVisible();
  });

  it('shows disabled icon and disabled text when SSO is disabled', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { data: [makeIdpConfig({ enabled: false })], results: 1 },
      error: null,
      isLoading: false,
    });

    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByLabelText('Status is inactive')).toBeVisible();
    expect(
      screen.getByText(
        'SSO is disabled. All users log in using alternative methods.'
      )
    ).toBeVisible();
  });

  it('shows active icon and not-enforced text when SSO is enabled but not enforced', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: {
        data: [makeIdpConfig({ enabled: true, enforce: false })],
        results: 1,
      },
      error: null,
      isLoading: false,
    });

    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByLabelText('Status is active')).toBeVisible();
    expect(
      screen.getByText(
        'SSO is enabled but not enforced. All users log in using alternative methods.'
      )
    ).toBeVisible();
  });

  it('shows active icon and enforced text when SSO is enabled and enforced and there are excluded users', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: {
        data: [
          makeIdpConfig({
            enabled: true,
            enforce: true,
            excluded_users_count: 2,
          }),
        ],
        results: 1,
      },
      error: null,
      isLoading: false,
    });

    renderWithProviders(<LoginSettingsLanding />);

    expect(screen.getByLabelText('Status is active')).toBeVisible();
    expect(
      screen.getByText(
        'SSO is enforced. All users log in with SSO, except for 2 users listed as exceptions.'
      )
    ).toBeVisible();
  });
});
