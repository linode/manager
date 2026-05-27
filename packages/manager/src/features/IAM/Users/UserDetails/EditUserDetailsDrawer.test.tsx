import { profileFactory } from '@linode/utilities';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { accountUserFactory } from 'src/factories';
import {
  getCdsTextFieldInput,
  getCdsTooltipHostByText,
} from 'src/features/IAM/utilities/testHelpers';
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

const getDrawerInputs = async () => {
  const [usernameHost, emailHost] = Array.from(
    document.querySelectorAll<HTMLElement>('cds-text-field')
  );

  expect(usernameHost).toBeInTheDocument();
  expect(emailHost).toBeInTheDocument();

  const usernameInput = await getCdsTextFieldInput(usernameHost);
  const emailInput = await getCdsTextFieldInput(emailHost);

  expect(usernameInput).toBeTruthy();
  expect(emailInput).toBeTruthy();

  return {
    emailInput,
    emailHost,
    usernameInput,
    usernameHost,
  };
};

describe('EditUserDetailsDrawer', () => {
  describe('Username field', () => {
    it("initializes the form with the user's username and email", async () => {
      const user = accountUserFactory.build();

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput, usernameInput } = await getDrawerInputs();

      await waitFor(() => {
        expect(usernameInput).toHaveValue(user.username);
        expect(emailInput).toHaveValue(user.email);
      });
    });

    it('disables the username field and shows a tooltip when canUpdateUser is false', async () => {
      const user = accountUserFactory.build();

      renderWithTheme(
        <EditUserDetailsDrawer
          {...defaultProps}
          activeUser={user}
          canUpdateUser={false}
        />
      );

      const { usernameInput } = await getDrawerInputs();

      expect(usernameInput).toBeDisabled();
      expect(
        getCdsTooltipHostByText(
          document,
          'Restricted users cannot update their username. Please contact an account administrator.'
        )
      ).toBeDefined();
    });

    it('disables the username field for a proxy user', async () => {
      const user = accountUserFactory.build({
        user_type: 'proxy',
        username: 'proxy-user-1',
      });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { usernameInput } = await getDrawerInputs();

      expect(usernameInput).toBeDisabled();
      expect(
        getCdsTooltipHostByText(document, 'This field can’t be modified.')
      ).toBeDefined();
    });

    it('enables the Save button when the username is changed and canUpdateUser is true', async () => {
      const user = accountUserFactory.build({
        username: 'my-linode-username',
      });

      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'my-linode-username' }),
      });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { usernameInput } = await getDrawerInputs();
      const saveButton = screen.getByRole('button', { name: 'Save' });

      await waitFor(() => {
        expect(usernameInput).toHaveValue(user.username);
      });

      expect(saveButton).toBeDisabled();

      await userEvent.type(usernameInput as HTMLInputElement, '-updated');
      expect(saveButton).toBeEnabled();
    });

    it('Save button is disabled on initial render when canUpdateUser is false', async () => {
      const user = accountUserFactory.build({
        username: 'my-linode-username',
      });

      renderWithTheme(
        <EditUserDetailsDrawer
          {...defaultProps}
          activeUser={user}
          canUpdateUser={false}
        />
      );

      const { usernameInput } = await getDrawerInputs();

      await waitFor(() => {
        expect(usernameInput).toHaveValue(user.username);
      });

      expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
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

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput } = await getDrawerInputs();

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });

      expect(
        getCdsTooltipHostByText(
          document,
          'You can’t change another user’s email address.'
        )
      ).toBeDefined();
    });

    it('disables the email field for a proxy user', async () => {
      const user = accountUserFactory.build({
        user_type: 'proxy',
        username: 'proxy-user-1',
      });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput } = await getDrawerInputs();

      expect(emailInput).toBeDisabled();
      expect(
        getCdsTooltipHostByText(document, 'This field can’t be modified.')
      ).toBeDefined();
    });

    it('shows a validation error for an invalid email address', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'user-1' }),
      });
      const user = accountUserFactory.build({ username: 'user-1' });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput } = await getDrawerInputs();

      await userEvent.click(emailInput as HTMLInputElement);
      await userEvent.keyboard('{Meta>}a{/Meta}{Backspace}');
      await userEvent.type(emailInput as HTMLInputElement, 'user#@example.com');
      await userEvent.click(screen.getByRole('button', { name: 'Save' }));

      expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
    });

    it('disables the email field when the active user is not the logged-in user', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: profileFactory.build({ username: 'logged-in-user' }),
      });
      const user = accountUserFactory.build({ username: 'another-user' });

      renderWithTheme(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput } = await getDrawerInputs();

      expect(emailInput).toBeDisabled();
    });
  });
});
