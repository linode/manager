import { profileFactory } from '@linode/utilities';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { EditUserDetailsDrawer } from './EditUserDetailsDrawer';

const queryMocks = vi.hoisted(() => ({
  useProfile: vi.fn().mockReturnValue({}),
}));

vi.mock('@linode/queries', async () => {
  const actual = await vi.importActual('@linode/queries');
  return {
    ...actual,
    useProfile: queryMocks.useProfile,
  };
});

const defaultProps = {
  canUpdateUser: true,
  onClose: vi.fn(),
  open: true,
};

describe('EditUserDetailsDrawer', () => {
  describe('Username field', () => {
    it("initializes the form with the user's username and email", async () => {
      const user = accountUserFactory.build();

      const { getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      expect(getByLabelText('Username')).toHaveDisplayValue(user.username);
      expect(getByLabelText('Email')).toHaveDisplayValue(user.email);
    });

    it('disables the username field and shows a tooltip when canUpdateUser is false', async () => {
      const user = accountUserFactory.build();

      const { getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer
          {...defaultProps}
          activeUser={user}
          canUpdateUser={false}
        />
      );

      expect(getByLabelText('Username')).toBeDisabled();
      expect(
        getByLabelText(
          'Restricted users cannot update their username. Please contact an account administrator.'
        )
      ).toBeVisible();
    });

    it("disables the username field for a proxy user", async () => {
      const user = accountUserFactory.build({
        user_type: 'proxy',
        username: 'proxy-user-1',
      });

      const { getAllByLabelText, getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      // Both username and email fields share the same tooltip for proxy users;
      // getAllByLabelText handles the case where the aria-label appears more than once.
      const tooltips = getAllByLabelText('This field can\u2019t be modified.');
      expect(tooltips.length).toBeGreaterThan(0);
      expect(getByLabelText('Username')).toBeDisabled();
    });

    it('enables the Save button when the username is changed and canUpdateUser is true', async () => {
      const user = accountUserFactory.build({
        username: 'my-linode-username',
      });

      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'my-linode-username' }),
      });

      const { findByDisplayValue, getByLabelText, getByRole } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      await findByDisplayValue(user.username);

      const saveButton = getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();

      await userEvent.type(getByLabelText('Username'), '-updated');
      expect(saveButton).toBeEnabled();
    });

    it('Save button is disabled on initial render when canUpdateUser is false', async () => {
      const user = accountUserFactory.build({
        username: 'my-linode-username',
      });

      const { findByDisplayValue, getByRole } = renderWithTheme(
        <EditUserDetailsDrawer
          {...defaultProps}
          activeUser={user}
          canUpdateUser={false}
        />
      );

      await findByDisplayValue(user.username);

      expect(getByRole('button', { name: 'Save' })).toBeDisabled();
    });
  });

  describe('Email field', () => {
    it("disables the email field when viewing another user's profile", async () => {
      const profile = profileFactory.build({ username: 'my-linode-user-1' });
      const user = accountUserFactory.build({ username: 'my-linode-user-2' });

      server.use(
        http.get('*/v4/profile', () => {
          return HttpResponse.json(profile);
        })
      );

      const { findByLabelText, getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const warning = await findByLabelText(
        'You can\u2019t change another user\u2019s email address.'
      );
      expect(warning).toBeInTheDocument();
      expect(getByLabelText('Email')).toBeDisabled();
    });

    it("disables the email field for a proxy user", async () => {
      const user = accountUserFactory.build({
        user_type: 'proxy',
        username: 'proxy-user-1',
      });

      const { getAllByLabelText, getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const tooltips = getAllByLabelText('This field can\u2019t be modified.');
      expect(tooltips.length).toBeGreaterThan(0);
      expect(getByLabelText('Email')).toBeDisabled();
    });

    it('shows a validation error for an invalid email address', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'user-1' }),
      });
      const user = accountUserFactory.build({ username: 'user-1' });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const emailInput = screen.getByLabelText('Email');
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, 'user#@example.com');

      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(
        screen.getByText(/invalid email address/i)
      ).toBeInTheDocument();
    });

    it('disables the email field when the active user is not the logged-in user', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'logged-in-user' }),
      });
      const user = accountUserFactory.build({ username: 'another-user' });

      const { getByLabelText } = renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      expect(getByLabelText('Email')).toBeDisabled();
    });
  });
});
