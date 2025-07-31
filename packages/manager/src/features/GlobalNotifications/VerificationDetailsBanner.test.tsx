import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VerificationDetailsBanner } from './VerificationDetailsBanner';

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

describe('VerificationDetailsBanner', () => {
  it('renders without errors', () => {
    const { getByText } = renderWithTheme(
      <VerificationDetailsBanner
        hasSecurityQuestions={true}
        hasVerifiedPhoneNumber={true}
      />
    );

    expect(
      getByText(
        'Add verification details to enhance account security and ensure prompt assistance when needed.'
      )
    ).toBeInTheDocument();
  });

  it('renders warning notice when security questions are missing', () => {
    const { getByTestId } = renderWithTheme(
      <VerificationDetailsBanner
        hasSecurityQuestions={false}
        hasVerifiedPhoneNumber={true}
      />
    );

    // Ensure that the warning notice is rendered
    expect(getByTestId('confirmButton')).toBeInTheDocument();
  });

  it('renders warning notice when phone number is not verified', () => {
    const { getByTestId } = renderWithTheme(
      <VerificationDetailsBanner
        hasSecurityQuestions={true}
        hasVerifiedPhoneNumber={false}
      />
    );

    // Ensure that the warning notice is rendered
    expect(getByTestId('confirmButton')).toBeInTheDocument();
  });

  it('triggers a navigation on button click', async () => {
    const { getByTestId } = renderWithTheme(
      <VerificationDetailsBanner
        hasSecurityQuestions={false}
        hasVerifiedPhoneNumber={true}
      />
    );

    // Trigger button click
    await userEvent.click(getByTestId('confirmButton'));

    // Ensure that navigation is called with the correct arguments
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/profile/auth',
      search: {
        focusSecurityQuestions: true,
        focusTel: false,
      },
    });
  });
});
