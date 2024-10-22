import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { profileFactory } from 'src/factories';
import { HttpResponse, http, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsernameForm } from './UsernameForm';

describe('UsernameForm', () => {
  it('renders a label and input', () => {
    const { getByLabelText, getByText } = renderWithTheme(<UsernameForm />);

    expect(getByLabelText('Username')).toBeVisible();
    expect(getByText('Update Username')).toBeVisible();
  });

  it("populates the form with the current user's username", async () => {
    const profile = profileFactory.build({ username: 'my-linode-username' });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { findByDisplayValue } = renderWithTheme(<UsernameForm />);

    await findByDisplayValue(profile.username);
  });

  it('disables the input if the user is restricted', async () => {
    const profile = profileFactory.build({ restricted: true });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { getByLabelText } = renderWithTheme(<UsernameForm />);

    await waitFor(() => {
      expect(getByLabelText('Username')).toBeDisabled();
    });

    expect(
      getByLabelText(
        'Restricted users cannot update their username. Please contact an account administrator.'
      )
    ).toBeVisible();
  });

  it('disables the input if the user is a proxy user', async () => {
    const profile = profileFactory.build({
      restricted: false,
      user_type: 'proxy',
    });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { getByLabelText } = renderWithTheme(<UsernameForm />);

    await waitFor(() => {
      expect(getByLabelText('Username')).toBeDisabled();
    });

    expect(getByLabelText('This field can’t be modified.')).toBeVisible();
  });

  it('enables the save button when the user makes a change to the username', async () => {
    const profile = profileFactory.build({ username: 'my-linode-username' });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { findByDisplayValue, getByLabelText, getByText } = renderWithTheme(
      <UsernameForm />
    );

    await findByDisplayValue(profile.username);

    const saveButton = getByText('Update Username').closest('button');

    expect(saveButton).toBeDisabled();

    await userEvent.type(getByLabelText('Username'), 'my-linode-username-1');

    expect(saveButton).toBeEnabled();
  });
});
