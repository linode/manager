import { act, fireEvent } from '@testing-library/react';
import React from 'react';

import { SessionExpirationDialog } from 'src/features/Account/SwitchAccounts/SessionExpirationDialog';
import { renderWithTheme } from 'src/utilities/testHelpers';

const mockParentChildAuthentication = {
  createToken: vi.fn(),
  revokeToken: vi.fn(() => Promise.resolve()), // Ensure it returns a resolved promise
  updateCurrentToken: vi.fn(),
  validateParentToken: vi.fn().mockReturnValue(false),
};

// Mock useParentChildAuthentication with spies for createToken, revokeToken, and updateCurrentToken
vi.mock(
  'src/features/Account/SwitchAccounts/useParentChildAuthentication',
  () => ({
    useParentChildAuthentication: vi.fn(() => mockParentChildAuthentication),
  })
);

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

const realLocation = window.location;

afterAll(() => {
  window.location = realLocation;
});

describe('SessionExpirationDialog', () => {
  it('renders correctly when isOpen is true', async () => {
    const { getByText } = renderWithTheme(<SessionExpirationDialog />);

    expect(getByText('Your session is about to expire')).toBeInTheDocument();
  });

  it('tests the Continue Working button when is clicked', async () => {
    const { getByText } = renderWithTheme(<SessionExpirationDialog />);

    await act(async () => {
      fireEvent.click(getByText('Continue Working'));
      await Promise.resolve();
    });

    expect(mockParentChildAuthentication.createToken).toHaveBeenCalled();
  });

  it('calls history.push("/logout") if parent token is invalid when Log Out button is clicked', async () => {
    // See this blog post: https://remarkablemark.org/blog/2018/11/17/mock-window-location/
    const mockReload = vi.fn();
    delete (window as Partial<Window>).location;

    window.location = { ...realLocation, reload: mockReload };

    const { getByText } = renderWithTheme(<SessionExpirationDialog />);

    await act(async () => {
      fireEvent.click(getByText('Log Out'));
      await Promise.resolve();
    });

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/logout',
    });
    expect(mockReload).toHaveBeenCalled();
  });
});
