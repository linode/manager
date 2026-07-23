import { screen } from '@testing-library/react';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { TwoFactor } from './TwoFactor';

const COMPANY_POLICY_ENFORCES_2FA_TEXT =
  'Your company policy enforces two-factor authentication.';

const queryMocks = vi.hoisted(() => ({
  useSecurityQuestions: vi.fn(),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useSecurityQuestions: queryMocks.useSecurityQuestions,
  };
});

const answeredSecurityQuestions = {
  security_questions: [
    {
      id: 1,
      question: 'In what city were you born?',
      response: 'Springfield',
    },
    {
      id: 2,
      question: 'What is the name of your oldest sibling?',
      response: 'Alex',
    },
    {
      id: 3,
      question: 'What was the first concert you attended?',
      response: 'Rock Fest',
    },
  ],
};

describe('TwoFactor', () => {
  beforeEach(() => {
    queryMocks.useSecurityQuestions.mockReturnValue({
      data: answeredSecurityQuestions,
    });
  });

  it('disables the toggle when 2FA is enforced and already enabled', () => {
    renderWithTheme(<TwoFactor isTfaEnforced twoFactor username="mock-user" />);

    const toggle = screen.getByRole('switch');

    expect(toggle).toBeChecked();
    expect(toggle).toBeDisabled();
    expect(screen.getByText(COMPANY_POLICY_ENFORCES_2FA_TEXT)).toBeVisible();
    expect(screen.getByText('Reset two-factor authentication')).toBeVisible();
  });

  it('allows enabling 2FA when 2FA is enforced but currently disabled', () => {
    renderWithTheme(
      <TwoFactor isTfaEnforced twoFactor={false} username="mock-user" />
    );

    const toggle = screen.getByRole('switch');

    expect(toggle).not.toBeChecked();
    expect(toggle).not.toBeDisabled();
    expect(
      screen.queryByText(COMPANY_POLICY_ENFORCES_2FA_TEXT)
    ).not.toBeInTheDocument();
  });

  it('leaves the toggle enabled when 2FA is optional', () => {
    renderWithTheme(<TwoFactor twoFactor username="mock-user" />);

    const toggle = screen.getByRole('switch');

    expect(toggle).toBeChecked();
    expect(toggle).not.toBeDisabled();
    expect(
      screen.queryByText(COMPANY_POLICY_ENFORCES_2FA_TEXT)
    ).not.toBeInTheDocument();
  });
});
