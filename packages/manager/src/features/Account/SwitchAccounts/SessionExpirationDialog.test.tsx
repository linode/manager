import { act, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

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

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

const realLocation = window.location;

afterAll(() => {
  window.location = realLocation;
});

// Mock useHistory
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

describe('SessionExpirationDialog', () => {
  it('renders correctly when isOpen is true', () => {
    const onCloseMock = vi.fn();
    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SessionExpirationDialog isOpen={true} onClose={onCloseMock} />
      </MemoryRouter>
    );

    expect(getByText('Your session is about to expire')).toBeInTheDocument();
  });

  it('tests the Continue Working button when is clicked', async () => {
    const onCloseMock = vi.fn();
    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SessionExpirationDialog isOpen={true} onClose={onCloseMock} />
      </MemoryRouter>
    );

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

    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SessionExpirationDialog isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    await act(async () => {
      fireEvent.click(getByText('Log Out'));
      await Promise.resolve();
    });

    expect(mockHistory.push).toHaveBeenCalledWith('/logout');
    expect(mockReload).toHaveBeenCalled();
  });
});
