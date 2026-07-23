import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { ERROR_STATE_TEXT, ERROR_STATE_TITLE } from '../../../Shared/constants';
import {
  getCdsButtonByText,
  getSwitchControl,
} from '../../../utilities/testHelpers';
import {
  mockMatchMedia,
  renderWithProviders,
} from '../../../utilities/testHelpers';
import { EnforcementSettings } from './EnforcementSettings';

const mockEnqueueSnackbar = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useGetIdpConfigsQuery: vi.fn().mockReturnValue({}),
  useGetIdpConfigQuery: vi.fn().mockReturnValue({}),
  useGetIdpConfigUsersIncludedQuery: vi.fn().mockReturnValue({}),
  useUpdateIdpConfigMutation: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
  useUpdateIdpConfigUsersIncludedMutation: vi
    .fn()
    .mockReturnValue({ mutateAsync: vi.fn() }),
  useGetIdpConfigUsersExcludedQuery: vi.fn().mockReturnValue({}),
  useUpdateIdpConfigUsersExcludedMutation: vi
    .fn()
    .mockReturnValue({ mutateAsync: vi.fn() }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetIdpConfigsQuery: queryMocks.useGetIdpConfigsQuery,
    useGetIdpConfigQuery: queryMocks.useGetIdpConfigQuery,
    useGetIdpConfigUsersIncludedQuery:
      queryMocks.useGetIdpConfigUsersIncludedQuery,
    useUpdateIdpConfigMutation: queryMocks.useUpdateIdpConfigMutation,
    useUpdateIdpConfigUsersIncludedMutation:
      queryMocks.useUpdateIdpConfigUsersIncludedMutation,
    useGetIdpConfigUsersExcludedQuery:
      queryMocks.useGetIdpConfigUsersExcludedQuery,
    useUpdateIdpConfigUsersExcludedMutation:
      queryMocks.useUpdateIdpConfigUsersExcludedMutation,
  };
});

const mockIdpConfig = {
  id: 'euuid-123',
  enabled: false,
  enforce: false,
  saml: {
    entity_id: 'entity-id',
    identity_element: 'NAME_ID',
    idp_url: 'https://idp.example.com',
    public_certificates: [
      {
        certificate: 'cert',
        created: '2024-01-01T00:00:00.000Z',
        created_by: 'user',
        id: 'cert-id',
        not_after: '2099-01-01T00:00:00.000Z',
        not_before: '2024-01-01T00:00:00.000Z',
      },
    ],
  },
};

const ACKNOWLEDGMENT_TEXT =
  'I understand that my changes will be applied immediately and may affect the way users log in.';

beforeAll(() => mockMatchMedia());

describe('EnforcementSettings', () => {
  beforeEach(() => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: { data: [{ id: 'euuid-123' }], results: 1 },
      error: null,
      isLoading: false,
    });
    queryMocks.useGetIdpConfigQuery.mockReturnValue({
      data: mockIdpConfig,
      error: null,
      isLoading: false,
    });
    queryMocks.useGetIdpConfigUsersIncludedQuery.mockReturnValue({
      data: { data: [], results: 0 },
      error: null,
      isLoading: false,
    });
    queryMocks.useGetIdpConfigUsersExcludedQuery.mockReturnValue({
      data: { data: [], results: 0 },
      error: null,
      isLoading: false,
    });
    queryMocks.useUpdateIdpConfigMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
    queryMocks.useUpdateIdpConfigUsersIncludedMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
    queryMocks.useUpdateIdpConfigUsersExcludedMutation.mockReturnValue({
      mutateAsync: vi.fn().mockResolvedValue({}),
      isPending: false,
    });
    mockEnqueueSnackbar.mockReset();
  });

  it('shows a loading state while IDP configs are loading', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows a loading state while the IDP config is loading', () => {
    queryMocks.useGetIdpConfigQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows an error state when fetching IDP configs fails', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('shows an error state when fetching the IDP config fails', () => {
    queryMocks.useGetIdpConfigQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders the Activation Status section', () => {
    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText('SSO Enforcement Settings')).toBeVisible();
  });

  it('renders the submit button as disabled when the form is not dirty', async () => {
    const { container } = renderWithProviders(<EnforcementSettings />);

    const submitButton = await getCdsButtonByText(container, 'Save Changes');
    expect(submitButton).toBeDisabled();
  });

  it('does not render the acknowledgment checkbox when activation status is not dirty', () => {
    renderWithProviders(<EnforcementSettings />);

    expect(
      screen.queryByText(
        /I understand updates apply immediately and will affect how/i
      )
    ).not.toBeInTheDocument();
  });

  it('shows the acknowledgment checkbox when activation status is changed', async () => {
    renderWithProviders(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    expect(screen.getByText(ACKNOWLEDGMENT_TEXT)).toBeVisible();
  });

  it('hides the acknowledgment checkbox when ssoEnabled is toggled back to its initial value', async () => {
    renderWithProviders(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);

    // Enable SSO — checkbox should appear
    await userEvent.click(enableControl as HTMLButtonElement);
    expect(screen.getByText(ACKNOWLEDGMENT_TEXT)).toBeVisible();

    // Disable SSO (back to initial value) — checkbox should disappear
    await userEvent.click(enableControl as HTMLButtonElement);
    expect(screen.queryByText(ACKNOWLEDGMENT_TEXT)).not.toBeInTheDocument();
  });

  it('hides the acknowledgment checkbox when ssoEnabled and ssoEnforced are both toggled back to their initial values', async () => {
    renderWithProviders(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);

    // Enable SSO
    await userEvent.click(enableControl as HTMLButtonElement);

    const enforceHost = screen
      .getByText('Enforce SSO')
      .closest('cds-switch') as HTMLElement;
    const enforceControl = await getSwitchControl(enforceHost);

    // Enable Enforce SSO
    await userEvent.click(enforceControl as HTMLButtonElement);

    // Disable SSO (also resets ssoEnforced back to false via setValue with shouldDirty: true)
    await userEvent.click(enableControl as HTMLButtonElement);

    // Both fields are back to their initial values — checkbox should not be visible
    expect(screen.queryByText(ACKNOWLEDGMENT_TEXT)).not.toBeInTheDocument();
  });

  it('enables the submit button when the form is dirty', async () => {
    const { container } = renderWithProviders(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    const submitButton = await getCdsButtonByText(container, 'Save Changes');
    expect(submitButton).toBeEnabled();
  });

  it('shows a loading state while included users are loading', () => {
    queryMocks.useGetIdpConfigUsersIncludedQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows a loading state while excluded users are loading', () => {
    queryMocks.useGetIdpConfigUsersExcludedQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeVisible();
  });

  it('shows an error state when fetching included users fails', () => {
    queryMocks.useGetIdpConfigUsersIncludedQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('shows an error state when fetching excluded users fails', () => {
    queryMocks.useGetIdpConfigUsersExcludedQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders the Included Users Panel section', () => {
    renderWithProviders(<EnforcementSettings />);

    expect(screen.getByText('SSO-Required Users')).toBeVisible();
  });

  it('shows the acknowledgment validation error when submitting without checking', async () => {
    const { container } = renderWithProviders(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    const submitButton = await getCdsButtonByText(container, 'Save Changes');
    await userEvent.click(submitButton as HTMLButtonElement);

    await waitFor(() => {
      expect(
        screen.getByText(
          'You need to confirm that you understand the impact of applied changes.'
        )
      ).toBeVisible();
    });
  });

  it('renders the Excluded Users Panel section', () => {
    renderWithProviders(<EnforcementSettings />);

    expect(
      screen.getByRole('heading', { name: 'SSO User Exceptions' })
    ).toBeVisible();
  });

  describe('summary banner', () => {
    it('shows disabled summary when SSO is not enabled', () => {
      const { container } = renderWithProviders(<EnforcementSettings />);

      const banner = container.querySelector('cds-notification-banner');

      expect(banner).not.toBeNull();
      expect(banner?.textContent).toContain(
        'SSO is disabled and not enforced. All users log in using alternative methods.'
      );
    });

    it('updates to enabled-not-enforced summary after enabling SSO', async () => {
      const { container } = renderWithProviders(<EnforcementSettings />);

      const enableHost = screen
        .getByText('Enable SSO')
        .closest('cds-switch') as HTMLElement;
      const enableControl = await getSwitchControl(enableHost);
      await userEvent.click(enableControl as HTMLButtonElement);

      const banner = container.querySelector('cds-notification-banner');

      expect(banner).not.toBeNull();
      expect(banner?.textContent).toContain(
        'SSO is enabled but not enforced for any users. All users log in using alternative methods.'
      );
    });

    it('updates to fully-enforced summary after enabling SSO and enforcement', async () => {
      const { container } = renderWithProviders(<EnforcementSettings />);

      const enableHost = screen
        .getByText('Enable SSO')
        .closest('cds-switch') as HTMLElement;
      const enableControl = await getSwitchControl(enableHost);
      await userEvent.click(enableControl as HTMLButtonElement);

      const enforceHost = screen
        .getByText('Enforce SSO')
        .closest('cds-switch') as HTMLElement;
      const enforceControl = await getSwitchControl(enforceHost);
      await userEvent.click(enforceControl as HTMLButtonElement);

      const banner = container.querySelector('cds-notification-banner');

      expect(banner).not.toBeNull();
      expect(banner?.textContent).toContain(
        'SSO is enabled and enforced. All users are required to log in with SSO. There are no SSO user exceptions (not recommended).'
      );
    });
  });
});
