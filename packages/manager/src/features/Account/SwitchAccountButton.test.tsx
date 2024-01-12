import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { SwitchAccountButton } from 'src/features/Account/SwitchAccountButton';
import { renderWithTheme } from 'src/utilities/testHelpers';

describe('SwitchAccountButton', () => {
  test('renders Switch Account button with SwapIcon', () => {
    renderWithTheme(<SwitchAccountButton />);

    expect(screen.getByText('Switch Account')).toBeInTheDocument();

    expect(screen.getByTestId('swap-icon')).toBeInTheDocument();
  });

  test('calls onClick handler when button is clicked', () => {
    const onClickMock = vi.fn();
    renderWithTheme(<SwitchAccountButton onClick={onClickMock} />);

    userEvent.click(screen.getByText('Switch Account'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });
});
