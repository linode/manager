import { profileFactory } from '@linode/utilities';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsernameForm } from './UsernameForm';

const queryMocks = vi.hoisted(() => ({
  userPermissions: vi.fn(() => ({
    data: {
      update_user: false,
    },
  })),
}));

vi.mock('src/features/IAM/hooks/usePermissions', () => ({
  usePermissions: queryMocks.userPermissions,
}));

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

  it('disables the input if the user doesn not have update_user permission', async () => {
    const { getByLabelText } = renderWithTheme(<UsernameForm />);

    expect(getByLabelText('Username')).toBeDisabled();

    expect(
      getByLabelText(
        'Restricted users cannot update their username. Please contact an account administrator.'
      )
    ).toBeVisible();
  });

  it('disables the input if the user is a proxy user', async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_user: true,
      },
    });

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

  it('enables the save button when the user makes a change to the username and has update_user permission', async () => {
    const profile = profileFactory.build({ username: 'my-linode-username' });

    server.use(http.get('*/v4/profile', () => HttpResponse.json(profile)));

    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_user: true,
      },
    });

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
