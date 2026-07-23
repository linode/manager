import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { createProfile, createUser } from '../../factories';
import {
  changeCdsTextField,
  expectCdsFormError,
  getCdsTextFieldInput,
  getCdsTooltipHostByText,
  submitCdsDrawerForm,
} from '../../utilities/testHelpers';
import { renderWithProviders } from '../../utilities/testHelpers';
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
    emailHost: emailHost!,
    emailInput,
    usernameHost: usernameHost!,
    usernameInput,
  };
};

describe('EditUserDetailsDrawer', () => {
  beforeEach(() => {
    queryMocks.useProfile.mockReturnValue({});
  });

  describe('Username field', () => {
    it("initializes the form with the user's username and email", async () => {
      const user = createUser();

      renderWithProviders(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput, usernameInput } = await getDrawerInputs();

      await waitFor(() => {
        expect(usernameInput).toHaveValue(user.username);
        expect(emailInput).toHaveValue(user.email);
      });
    });

    it('disables the username field and shows a tooltip when canUpdateUser is false', async () => {
      const user = createUser();

      renderWithProviders(
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

    it('disables the username field for a delegate user', async () => {
      const user = createUser({
        user_type: 'delegate',
        username: 'delegate-user-1',
      });

      renderWithProviders(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { usernameInput } = await getDrawerInputs();

      expect(usernameInput).toBeDisabled();
      expect(
        getCdsTooltipHostByText(document, 'This field can’t be modified.')
      ).toBeDefined();
    });

    it('enables the Save button when the username is changed and canUpdateUser is true', async () => {
      const user = createUser({
        username: 'my-linode-username',
      });

      queryMocks.useProfile.mockReturnValue({
        data: createProfile({ username: 'my-linode-username' }),
      });

      renderWithProviders(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { usernameInput } = await getDrawerInputs();
      const saveButton = screen.getByTestId('submit');

      await waitFor(() => {
        expect(usernameInput).toHaveValue(user.username);
      });

      expect(saveButton).toBeDisabled();

      await userEvent.type(usernameInput as HTMLInputElement, '-updated');
      expect(saveButton).toBeEnabled();
    });

    it('Save button is disabled on initial render when canUpdateUser is false', async () => {
      const user = createUser({
        username: 'my-linode-username',
      });

      renderWithProviders(
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

      expect(screen.getByTestId('submit')).toBeDisabled();
    });
  });

  describe('Email field', () => {
    it("disables the email field when viewing another user's profile", async () => {
      const profile = createProfile({ username: 'my-linode-user-1' });
      const user = createUser({ username: 'my-linode-user-2' });

      queryMocks.useProfile.mockReturnValue({
        data: profile,
      });

      renderWithProviders(
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

    it('disables the email field for a delegate user', async () => {
      const user = createUser({
        user_type: 'delegate',
        username: 'delegate-user-1',
      });

      renderWithProviders(
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
        data: createProfile({ username: 'user-1' }),
      });
      const user = createUser({ username: 'user-1' });

      renderWithProviders(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailHost } = await getDrawerInputs();

      await changeCdsTextField(emailHost, 'user#@example.com');
      submitCdsDrawerForm();

      await expectCdsFormError(/valid email address/i);
    });

    it('disables the email field when the active user is not the logged-in user', async () => {
      queryMocks.useProfile.mockReturnValue({
        data: createProfile({ username: 'logged-in-user' }),
      });
      const user = createUser({ username: 'another-user' });

      renderWithProviders(
        <EditUserDetailsDrawer {...defaultProps} activeUser={user} />
      );

      const { emailInput } = await getDrawerInputs();

      expect(emailInput).toBeDisabled();
    });
  });
});
