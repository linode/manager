import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { UserEmailPanel } from './UserEmailPanel';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

// Mock useProfile
vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});
describe('UserEmailPanel', () => {
  it("initializes the form with the user's email", async () => {
    const user = accountUserFactory.build();

    const { getByLabelText } = renderWithTheme(
      <UserEmailPanel activeUser={user} canUpdateUser={true} />
    );

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
      <UserEmailPanel activeUser={user} canUpdateUser={false} />
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
      <UserEmailPanel activeUser={user} canUpdateUser={false} />
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

  it('shows validation error for invalid email address', async () => {
    queryMocks.useProfile.mockReturnValue({
      data: profileFactory.build({ username: 'user-1' }),
    });
    const user = accountUserFactory.build({
      username: 'user-1',
    });

    renderWithTheme(<UserEmailPanel activeUser={user} canUpdateUser={true} />);

    const emailInput = screen.getByLabelText('Email');

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'user#@example.com');

    const saveButton = screen.getByText('Save').closest('button');
    await userEvent.click(saveButton!);

    const errorText = screen.getByText(/invalid email address/i);
    expect(errorText).toBeInTheDocument();
  });

  it('disables the save button when the user does not have update_user permission', async () => {
    const user = accountUserFactory.build({
      email: 'my-linode-email',
    });

    const { getByRole, findByDisplayValue } = renderWithTheme(
      <UserEmailPanel activeUser={user} canUpdateUser={false} />
    );

    await findByDisplayValue(user.email);

    const saveButton = getByRole('button', { name: 'Save' });
    expect(saveButton).toBeDisabled();
  });
});
