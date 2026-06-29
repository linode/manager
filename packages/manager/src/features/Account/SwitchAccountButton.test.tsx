import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { renderWithTheme } from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
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

  test('renders Switch Back to Your Account for delegate users', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'delegate' }),
    });

    renderWithTheme(<SwitchAccountButton />);

    expect(
      screen.getByRole('button', { name: /switch back to your account/i })
    ).toBeEnabled();
  });
});
