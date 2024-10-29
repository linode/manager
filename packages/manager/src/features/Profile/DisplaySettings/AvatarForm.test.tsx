import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { AvatarForm } from './AvatarForm';

describe('AvatarForm', () => {
  it('renders a label, button, and avatar', () => {
    const { getByRole, getByTestId, getByText } = renderWithTheme(
      <AvatarForm />
    );

    expect(getByText('Avatar')).toBeVisible();
    expect(getByTestId('avatar')).toBeVisible();
    expect(getByRole('button', { name: 'Change Avatar Color' })).toBeVisible();
  });

  it('opens the avatar color dialog when the button is clicked', async () => {
    const { getByRole } = renderWithTheme(<AvatarForm />);

    const button = getByRole('button', { name: 'Change Avatar Color' });

    expect(button).toBeVisible();
    expect(button).toBeEnabled();

    await userEvent.click(button);

    expect(getByRole('heading', { name: 'Change Avatar Color' })).toBeVisible();
  });
});
