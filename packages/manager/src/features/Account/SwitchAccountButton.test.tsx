import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { renderWithTheme } from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      create_child_account_token: true,
    },
  })),
  useFlags: vi.fn().mockReturnValue({}),
}));
vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

vi.mock('src/hooks/useFlags', () => {
  const actual = vi.importActual('src/hooks/useFlags');
  return {
    ...actual,
    useFlags: queryMocks.useFlags,
  };
});

describe('SwitchAccountButton', () => {
  test('renders Switch Account button with SwapIcon', () => {
    renderWithTheme(<SwitchAccountButton />);

    expect(screen.getByText('Switch Account')).toBeInTheDocument();

    expect(screen.getByTestId('swap-icon')).toBeInTheDocument();
  });

  test('calls onClick handler when button is clicked', async () => {
    const onClickMock = vi.fn();
    renderWithTheme(<SwitchAccountButton onClick={onClickMock} />);

    await userEvent.click(screen.getByText('Switch Account'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  test('enables the button when user has create_child_account_token permission', () => {
    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: true },
    });

    renderWithTheme(<SwitchAccountButton />);

    const button = screen.getByRole('button', { name: /switch account/i });
    expect(button).toBeEnabled();
  });

  test('disables the button when user does not have create_child_account_token permission', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        create_child_account_token: false,
      },
    });

    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: true },
    });

    renderWithTheme(<SwitchAccountButton />);

    const button = screen.getByRole('button', { name: /switch account/i });
    expect(button).toBeDisabled();

    // Check that the tooltip is properly configured
    expect(button).toHaveAttribute('aria-describedby', 'button-tooltip');

    // Hover over the button to show the tooltip
    await userEvent.hover(button);

    // Wait for tooltip to appear and check its content
    await waitFor(() => {
      screen.getByRole('tooltip');
    });

    expect(
      screen.getByText('You do not have permission to switch accounts.')
    ).toBeVisible();
  });

  test('enables the button when iamDelegation flag is off', async () => {
    queryMocks.useFlags.mockReturnValue({
      iamDelegation: { enabled: false },
    });

    renderWithTheme(<SwitchAccountButton />);

    const button = screen.getByRole('button', { name: /switch account/i });
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('aria-describedby', 'button-tooltip');
  });
});
