import { screen } from '@testing-library/react';
import React from 'react';

import { profileFactory } from 'src/factories/profile';
import { DisplaySettings } from 'src/features/Profile/DisplaySettings/DisplaySettings';
import { renderWithTheme } from 'src/utilities/testHelpers';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/profile', async () => {
  const actual = await vi.importActual('src/queries/profile');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

describe('DisplaySettings component', () => {
  it('should disable SingleTextFieldForm components based on isProxyUser', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'proxy' }),
    });

    renderWithTheme(<DisplaySettings />);

    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).toHaveAttribute('disabled');

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('disabled');
  });

  it('Should only disable the SingleTextFieldForm components if the user is not a proxy user.', () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'child' }),
    });

    renderWithTheme(<DisplaySettings />);

    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).not.toHaveAttribute('disabled');

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).not.toHaveAttribute('disabled');
  });

  it('should disable the "Update Username" and "Update Email" buttons if the user is a proxy user.', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ user_type: 'proxy' }),
    });

    renderWithTheme(<DisplaySettings />);

    const updateUsernameButton = screen
      .getByText('Update Username')
      .closest('button');

    const updateEmailButton = screen
      .getByText('Update Email')
      .closest('button');

    expect(updateUsernameButton).not.toHaveAttribute('disabled');
    expect(updateUsernameButton).toHaveAttribute('aria-disabled', 'true');

    expect(updateEmailButton).not.toHaveAttribute('disabled');
    expect(updateEmailButton).toHaveAttribute('aria-disabled', 'true');
  });
});
