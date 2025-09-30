import { fireEvent } from '@testing-library/react';
import React from 'react';

import { SwitchAccountSessionDialog } from 'src/features/Account/SwitchAccounts/SwitchAccountSessionDialog';
import { renderWithTheme } from 'src/utilities/testHelpers';

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

describe('SwitchAccountSessionDialog', () => {
  it('renders correctly when isOpen is true', () => {
    const { getByText } = renderWithTheme(<SwitchAccountSessionDialog />);

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
    const { getByText } = renderWithTheme(<SwitchAccountSessionDialog />);

    fireEvent.click(getByText('Close'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('calls history.push("/logout") when Log in button is clicked', () => {
    const { getByText } = renderWithTheme(<SwitchAccountSessionDialog />);

    fireEvent.click(getByText('Log in'));
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/logout',
    });
  });
});
