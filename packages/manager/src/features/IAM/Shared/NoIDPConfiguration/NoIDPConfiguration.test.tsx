import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { getCdsButtonByText } from 'src/features/IAM/utilities/testHelpers';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { NoIDPConfiguration } from './NoIDPConfiguration';

const mockNavigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useLocation: vi.fn().mockReturnValue({ pathname: '/iam/login-settings/sso' }),
  useNavigate: vi.fn(() => mockNavigate),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useLocation: queryMocks.useLocation,
    useNavigate: queryMocks.useNavigate,
  };
});

const IDP_CONFIGURATIONS_PATH = '/iam/login-settings/sso/idp-configurations';

describe('NoIDPConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useLocation.mockReturnValue({
      pathname: '/iam/login-settings/sso',
    });
    queryMocks.useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders the zero state title and description', () => {
    renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    expect(screen.getByText('No data to display')).toBeVisible();
    expect(
      screen.getByText(/Once you create the IDP configuration/i)
    ).toBeVisible();
  });

  it('renders the enforcement description when not on the IDP configurations page', () => {
    renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    expect(screen.getByText(/manage its enforcement here\.$/i)).toBeVisible();
  });

  it('renders the "it will show up here" description when on the IDP configurations page', () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: IDP_CONFIGURATIONS_PATH,
    });

    renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    expect(screen.getByText(/it will show up here\./i)).toBeVisible();
  });

  it('renders an enabled create button for account admins', async () => {
    const { container } = renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );

    expect(createButton).toBeVisible();
    expect(createButton).toBeEnabled();
  });

  it('renders a disabled create button for non-admin users', async () => {
    const { container } = renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: false }} />
    );

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );

    expect(createButton).toBeInTheDocument();
    expect(createButton).toBeDisabled();
  });

  it('navigates to IDP configurations page when button is clicked and not already there', async () => {
    const { container } = renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );
    expect(createButton).toBeVisible();
    await userEvent.click(createButton as HTMLButtonElement);

    expect(mockNavigate).toHaveBeenCalledWith({
      to: IDP_CONFIGURATIONS_PATH,
    });
  });

  it('does not navigate when button is clicked on the IDP configurations page', async () => {
    queryMocks.useLocation.mockReturnValue({
      pathname: IDP_CONFIGURATIONS_PATH,
    });

    const { container } = renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: true }} />
    );

    const createButton = await getCdsButtonByText(
      container,
      'Create IDP Configuration'
    );
    expect(createButton).toBeVisible();
    await userEvent.click(createButton as HTMLButtonElement);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('renders the info icon when user is not an account admin', () => {
    const { container } = renderWithTheme(
      <NoIDPConfiguration permissions={{ is_account_admin: false }} />
    );

    // cds-icon is rendered inside the button for non-admins
    expect(container.querySelector('cds-icon')).toBeInTheDocument();
  });
});
