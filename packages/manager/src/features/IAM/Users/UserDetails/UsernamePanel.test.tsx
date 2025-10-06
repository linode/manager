import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UsernamePanel } from './UsernamePanel';

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

describe('UsernamePanel', () => {
  it("initializes the form with the user's username", async () => {
    const user = accountUserFactory.build();

    const { getByLabelText } = renderWithTheme(
      <UsernamePanel canUpdateUser={true} user={user} />
    );

    const usernameTextField = getByLabelText('Username');

    expect(usernameTextField).toHaveDisplayValue(user.username);
  });

  it('disables the input if the user doesn not have update_user permission', async () => {
    const user = accountUserFactory.build();

    const { getByLabelText } = renderWithTheme(
      <UsernamePanel canUpdateUser={false} user={user} />
    );

    expect(getByLabelText('Username')).toBeDisabled();

    expect(
      getByLabelText(
        'Restricted users cannot update their username. Please contact an account administrator.'
      )
    ).toBeVisible();
  });

  it("does not allow the user to update a proxy user's username", async () => {
    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_user: true,
      },
    });

    const user = accountUserFactory.build({
      user_type: 'proxy',
      username: 'proxy-user-1',
    });

    const { getByLabelText, getByText } = renderWithTheme(
      <UsernamePanel canUpdateUser={true} user={user} />
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

  it('enables the save button when the user makes a change to the username and has update_user permission', async () => {
    const user = accountUserFactory.build({
      username: 'my-linode-username',
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_user: true,
      },
    });

    const { getByLabelText, getByRole, findByDisplayValue } = renderWithTheme(
      <UsernamePanel canUpdateUser={true} user={user} />
    );

    await findByDisplayValue(user.username);

    const saveButton = getByRole('button', { name: 'Save' });

    expect(saveButton).toBeDisabled();

    await userEvent.type(getByLabelText('Username'), 'my-linode-username-1');

    expect(saveButton).toBeEnabled();
  });

  it('disables the save button when the user does not have update_user permission', async () => {
    const user = accountUserFactory.build({
      username: 'my-linode-username',
    });

    queryMocks.userPermissions.mockReturnValue({
      data: {
        update_user: false,
      },
    });

    const { getByRole, findByDisplayValue } = renderWithTheme(
      <UsernamePanel canUpdateUser={false} user={user} />
    );

    await findByDisplayValue(user.username);

    const saveButton = getByRole('button', { name: 'Save' });

    expect(saveButton).toBeDisabled();
  });
});
