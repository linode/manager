import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VerificationDetailsBanner } from './VerificationDetailsBanner';

const mockNavigate = vi.fn();
vi.hoisted(() => {
  const actual = vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

  it('triggers history push on button click', () => {
    const { getByTestId } = renderWithTheme(
      <VerificationDetailsBanner
        hasSecurityQuestions={false}
        hasVerifiedPhoneNumber={true}
      />
    );

    // Trigger button click
    fireEvent.click(getByTestId('confirmButton'));

    // Ensure that history.push is called with the correct arguments
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/profile/auth',
      search: {
        focusSecurityQuestions: true,
        focusTel: false,
      },
    });
  });
});
