import { fireEvent } from '@testing-library/react';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { MemoryRouter } from 'react-router-dom';

import { SwitchAccountSessionDialog } from 'src/features/Account/SwitchAccounts/SwitchAccountSessionDialog';
import { renderWithTheme } from 'src/utilities/testHelpers';

const mockHistory = {
  push: vi.fn(),
  replace: vi.fn(),
};

// Mock useHistory
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<any>('react-router-dom');
  return {
    ...actual,
    useHistory: vi.fn(() => mockHistory),
  };
});

describe('SwitchAccountSessionDialog', () => {
  it('renders correctly when isOpen is true', () => {
    const onCloseMock = vi.fn();
    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SwitchAccountSessionDialog isOpen={true} onClose={onCloseMock} />
      </MemoryRouter>
    );

    expect(getByText('Session expired')).toBeInTheDocument();
    expect(
      getByText(
        'Log in again to switch accounts or close this window to continue working on the current account.'
      )
    ).toBeInTheDocument();
    expect(getByText('Log in')).toBeInTheDocument();
    expect(getByText('Close')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onCloseMock = vi.fn();
    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SwitchAccountSessionDialog isOpen={true} onClose={onCloseMock} />
      </MemoryRouter>
    );

    fireEvent.click(getByText('Close'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls history.push("/logout") when Log in button is clicked', () => {
    const { getByText } = renderWithTheme(
      <MemoryRouter>
        <SwitchAccountSessionDialog isOpen={true} onClose={vi.fn()} />
      </MemoryRouter>
    );

    fireEvent.click(getByText('Log in'));
    expect(mockHistory.push).toHaveBeenCalledWith('/logout');
  });
});
