import { fireEvent } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { VerificationDetailsBanner } from './VerificationDetailsBanner';

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

// Used to mock query params
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

describe('VerificationDetailsBanner', () => {
  it('renders without errors', () => {
    const { getByText } = renderWithTheme(
      <BrowserRouter>
        <VerificationDetailsBanner
          hasSecurityQuestions={true}
          hasVerifiedPhoneNumber={true}
        />
      </BrowserRouter>
    );

    expect(
      getByText(
        'Add verification details to enhance account security and ensure prompt assistance when needed.'
      )
    ).toBeInTheDocument();
  });

  it('renders warning notice when security questions are missing', () => {
    const { getByTestId } = renderWithTheme(
      <BrowserRouter>
        <VerificationDetailsBanner
          hasSecurityQuestions={false}
          hasVerifiedPhoneNumber={true}
        />
      </BrowserRouter>
    );

    // Ensure that the warning notice is rendered
    expect(getByTestId('confirmButton')).toBeInTheDocument();
  });

  it('renders warning notice when phone number is not verified', () => {
    const { getByTestId } = renderWithTheme(
      <BrowserRouter>
        <VerificationDetailsBanner
          hasSecurityQuestions={true}
          hasVerifiedPhoneNumber={false}
        />
      </BrowserRouter>
    );

    // Ensure that the warning notice is rendered
    expect(getByTestId('confirmButton')).toBeInTheDocument();
  });

  it('triggers history push on button click', () => {
    const { getByTestId } = renderWithTheme(
      <BrowserRouter>
        <VerificationDetailsBanner
          hasSecurityQuestions={false}
          hasVerifiedPhoneNumber={true}
        />
      </BrowserRouter>
    );

    // Trigger button click
    fireEvent.click(getByTestId('confirmButton'));

    // Ensure that history.push is called with the correct arguments
    expect(mockHistory.push).toHaveBeenCalledWith('/profile/auth', {
      focusSecurityQuestions: true,
      focusTel: false,
    });
  });
});
