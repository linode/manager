import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithThemeAndRouter } from 'src/utilities/testHelpers';

import { UsernamePanel } from './UsernamePanel';

describe('UsernamePanel', () => {
  it("initializes the form with the user's username", async () => {
    const user = accountUserFactory.build();

    const { getByLabelText } = await renderWithThemeAndRouter(
      <UsernamePanel user={user} />
    );

    const usernameTextField = getByLabelText('Username');

    expect(usernameTextField).toHaveDisplayValue(user.username);
  });

  it("does not allow the user to update a proxy user's username", async () => {
    const user = accountUserFactory.build({
      user_type: 'proxy',
      username: 'proxy-user-1',
    });

    const { getByLabelText, getByText } = await renderWithThemeAndRouter(
      <UsernamePanel user={user} />
    );

    const warning = getByLabelText('This field can’t be modified.');

    // Verify there is a tooltip explaining that the user can't change
    // a proxy user's username.
    expect(warning).toBeInTheDocument();

    // Verify the input is disabled
    expect(getByLabelText('Username')).toBeDisabled();

    // Verify save button is disabled
    expect(getByText('Save').closest('button')).toBeDisabled();
  });
});
