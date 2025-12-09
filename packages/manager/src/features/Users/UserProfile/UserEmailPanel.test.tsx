import { profileFactory } from '@linode/utilities';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserEmailPanel } from './UserEmailPanel';

describe('UserEmailPanel', () => {
  it("initializes the form with the user's email", async () => {
    const user = accountUserFactory.build();

    const { getByLabelText } = renderWithTheme(<UserEmailPanel user={user} />);

    const emailTextField = getByLabelText('Email');

    expect(emailTextField).toHaveDisplayValue(user.email);
  });

  it("does not allow the user to update another user's email", async () => {
    const profile = profileFactory.build({ username: 'my-linode-user-1' });
    const user = accountUserFactory.build({ username: 'my-linode-user-2' });

    server.use(
      http.get('*/v4/profile', () => {
        return HttpResponse.json(profile);
      })
    );

    const { findByLabelText, getByLabelText, getByText } = renderWithTheme(
      <UserEmailPanel user={user} />
    );

    const warning = await findByLabelText(
      'You can’t change another user’s email address.'
    );

    // Verify there is a tooltip explaining that the user can't change
    // another user's email.
    expect(warning).toBeInTheDocument();

    // Verify the input is disabled
    expect(getByLabelText('Email')).toBeDisabled();

    // Verify save button is disabled
    expect(getByText('Save').closest('button')).toBeDisabled();
  });

  it("does not allow the user to update a proxy user's email", async () => {
    const user = accountUserFactory.build({
      user_type: 'proxy',
      username: 'proxy-user-1',
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <UserEmailPanel user={user} />
    );

    const warning = getByLabelText('This field can’t be modified.');

    // Verify there is a tooltip explaining that the user can't change
    // a proxy user's email.
    expect(warning).toBeInTheDocument();

    // Verify the input is disabled
    expect(getByLabelText('Email')).toBeDisabled();

    // Verify save button is disabled
    expect(getByText('Save').closest('button')).toBeDisabled();
  });
});
