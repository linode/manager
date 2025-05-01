import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EmailForm } from './EmailForm';

describe('EmailForm', () => {
  it('renders a label and input', () => {
    const { getByLabelText, getByText } = renderWithTheme(<EmailForm />);

    expect(getByLabelText('Email')).toBeVisible();
    expect(getByText('Update Email')).toBeVisible();
  });

  it("populates the form with the current user's email", async () => {
    const profile = profileFactory.build({ username: 'myself@linode.com' });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { findByDisplayValue } = renderWithTheme(<EmailForm />);

    await findByDisplayValue(profile.email);
  });

  it('disables the input if the user is a proxy user', async () => {
    const profile = profileFactory.build({
      user_type: 'proxy',
    });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { getByLabelText } = renderWithTheme(<EmailForm />);

    await waitFor(() => {
      expect(getByLabelText('Email')).toBeDisabled();
    });

    expect(getByLabelText('This field can’t be modified.')).toBeVisible();
  });

  it('enables the save button when the user makes a change to the email', async () => {
    const profile = profileFactory.build({ email: 'user@linode.com' });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    const { findByDisplayValue, getByLabelText, getByText } = renderWithTheme(
      <EmailForm />
    );

    await findByDisplayValue(profile.email);

    const saveButton = getByText('Update Email').closest('button');

    expect(saveButton).toBeDisabled();

    await userEvent.type(getByLabelText('Email'), 'user-1@linode.com');

    expect(saveButton).toBeEnabled();
  });
});
