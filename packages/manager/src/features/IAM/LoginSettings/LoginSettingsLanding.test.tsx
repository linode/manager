import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { LoginSettingsLanding } from './LoginSettingsLanding';

const mockNavigate = vi.fn();

const queryMocks = vi.hoisted(() => ({
  useNavigate: vi.fn(() => mockNavigate),
}));

vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: queryMocks.useNavigate,
  };
});

describe('LoginSettingsLanding', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it('renders the SSO enforcement landing content', () => {
    renderWithTheme(<LoginSettingsLanding />);

    expect(
      screen.getByRole('heading', { name: 'Single Sign-On Enforcement' })
    ).toBeVisible();
    expect(
      screen.getByText(/The single sign-on \(SSO\) enforcement enables you/i)
    ).toBeVisible();
  });

  it('navigates to IDP configurations when manage is clicked', async () => {
    renderWithTheme(<LoginSettingsLanding />);

    await userEvent.click(screen.getByText('Manage SSO Enforcement'));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/iam/login-settings/sso/idp-configurations',
    });
  });
});
