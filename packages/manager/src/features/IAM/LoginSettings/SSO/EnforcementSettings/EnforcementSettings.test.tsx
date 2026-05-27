import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import {
  ERROR_STATE_TEXT,
  ERROR_STATE_TITLE,
} from 'src/features/IAM/Shared/constants';
import {
  getCdsButtonByText,
  getSwitchControl,
} from 'src/features/IAM/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EnforcementSettings } from './EnforcementSettings';

const queryMocks = vi.hoisted(() => ({
  useGetIdpConfigsQuery: vi.fn().mockReturnValue({}),
  useGetIdpConfigQuery: vi.fn().mockReturnValue({}),
  useUpdateIdpConfigMutation: vi.fn().mockReturnValue({ mutateAsync: vi.fn() }),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useGetIdpConfigsQuery: queryMocks.useGetIdpConfigsQuery,
    useGetIdpConfigQuery: queryMocks.useGetIdpConfigQuery,
    useUpdateIdpConfigMutation: queryMocks.useUpdateIdpConfigMutation,
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
    queryMocks.useUpdateIdpConfigMutation.mockReturnValue({
      mutateAsync: vi.fn(),
    });
  });

  it('shows a loading state while IDP configs are loading', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithTheme(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('shows a loading state while the IDP config is loading', () => {
    queryMocks.useGetIdpConfigQuery.mockReturnValue({
      data: null,
      error: null,
      isLoading: true,
    });

    renderWithTheme(<EnforcementSettings />);

    expect(screen.getByTestId('circle-progress')).toBeInTheDocument();
  });

  it('shows an error state when fetching IDP configs fails', () => {
    queryMocks.useGetIdpConfigsQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithTheme(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('shows an error state when fetching the IDP config fails', () => {
    queryMocks.useGetIdpConfigQuery.mockReturnValue({
      data: null,
      error: [{ reason: 'An unexpected error occurred' }],
      isLoading: false,
    });

    renderWithTheme(<EnforcementSettings />);

    expect(screen.getByText(ERROR_STATE_TITLE)).toBeVisible();
    expect(screen.getByText(ERROR_STATE_TEXT)).toBeVisible();
  });

  it('renders the Activation Status section', () => {
    renderWithTheme(<EnforcementSettings />);

    expect(screen.getByText('Activation Status')).toBeVisible();
  });

  it('renders the submit button as disabled when the form is not dirty', async () => {
    const { container } = renderWithTheme(<EnforcementSettings />);

    const submitButton = await getCdsButtonByText(
      container,
      'Update SSO Enforcement'
    );
    expect(submitButton).toBeDisabled();
  });

  it('does not render the acknowledgment checkbox when activation status is not dirty', () => {
    renderWithTheme(<EnforcementSettings />);

    expect(
      screen.queryByText(/I understand that my changes will be applied/i)
    ).not.toBeInTheDocument();
  });

  it('shows the acknowledgment checkbox when activation status is changed', async () => {
    renderWithTheme(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    expect(
      screen.getByText(
        /I understand that my changes will be applied immediately/i
      )
    ).toBeVisible();
  });

  it('enables the submit button when the form is dirty', async () => {
    const { container } = renderWithTheme(<EnforcementSettings />);

    const enableHost = screen
      .getByText('Enable SSO')
      .closest('cds-switch') as HTMLElement;
    const enableControl = await getSwitchControl(enableHost);
    await userEvent.click(enableControl as HTMLButtonElement);

    const submitButton = await getCdsButtonByText(
      container,
      'Update SSO Enforcement'
    );
    expect(submitButton).toBeEnabled();
  });
});
