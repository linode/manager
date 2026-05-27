import { userNameErrors } from '@linode/validation';
import userEvent from '@testing-library/user-event';
import React from 'react';

import {
  expectNotificationBannerText,
  getCdsTextFieldInput,
} from 'src/features/IAM/utilities/testHelpers';
import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateUserDrawer } from './CreateUserDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
};

const testEmail = 'testuser@example.com';

const getDrawerInputs = async () => {
  const usernameHost = document.querySelector<HTMLElement>(
    'cds-text-field[data-qa-create-username]'
  );
  const emailHost = document.querySelector<HTMLElement>(
    'cds-text-field[data-qa-create-email]'
  );

  expect(usernameHost).toBeInTheDocument();
  expect(emailHost).toBeInTheDocument();

  const usernameInput = await getCdsTextFieldInput(usernameHost!);
  const emailInput = await getCdsTextFieldInput(emailHost!);

  expect(usernameInput).toBeTruthy();
  expect(emailInput).toBeTruthy();

  return {
    emailInput: emailInput!,
    usernameInput: usernameInput!,
  };
};

describe('CreateUserDrawer', () => {
  it('should render the drawer when open is true', () => {
    const { getByTestId } = renderWithTheme(<CreateUserDrawer {...props} />);

    const dialog = getByTestId('drawer');
    expect(dialog).toBeInTheDocument();
  });

  it('should allow the user to fill out the form',  async () => {
    const { getByTestId } = renderWithTheme(
      <CreateUserDrawer {...props} />
    );

    const dialog = getByTestId('drawer');
    expect(dialog).toBeInTheDocument();

    const { emailInput, usernameInput } = await getDrawerInputs();

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, testEmail);

    expect(usernameInput).toHaveValue('testuser');
    expect(emailInput).toHaveValue(testEmail);
  });

  it('should display an error message when submission fails', async () => {
    const mockErrorMessage = 'An unexpected error occurred.';

    server.use(
      http.post('*/account/users', () => {
        return HttpResponse.json(
          { errors: [{ reason: mockErrorMessage }] },
          { status: 500 }
        );
      })
    );

    const { getByTestId } = renderWithTheme(
      <CreateUserDrawer {...props} />
    );

    const dialog = getByTestId('drawer');
    expect(dialog).toBeInTheDocument();

    const { emailInput, usernameInput } = await getDrawerInputs();

    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(emailInput, testEmail);
    await userEvent.click(getByTestId('submit'));

    await expectNotificationBannerText(mockErrorMessage);
  });
});

describe('CreateUserDrawer - Username Validation', () => {
  const validEmail = 'test@example.com';

  const testUsernameValidation = async (
    username: string,
    expectedError: string
  ) => {
    const { findByText, getByTestId } = renderWithTheme(
      <CreateUserDrawer {...props} />
    );

    const { emailInput, usernameInput } = await getDrawerInputs();

    await userEvent.type(usernameInput, username);
    await userEvent.type(emailInput, validEmail);
    await userEvent.click(getByTestId('submit'));

    const errorMessage = await findByText(expectedError);
    expect(errorMessage).toBeInTheDocument();
  };

  it('should display error for username too short', async () => {
    await testUsernameValidation('ab', userNameErrors.lengthError);
  });

  it('should display error for username too long', async () => {
    const longUsername = 'a'.repeat(33);
    await testUsernameValidation(longUsername, userNameErrors.lengthError);
  });

  it('should display error for consecutive underscores', async () => {
    await testUsernameValidation('test__user', userNameErrors.consecutiveError);
  });

  it('should display error for consecutive dashes', async () => {
    await testUsernameValidation('test--user', userNameErrors.consecutiveError);
  });

  it('should display error for username starting with underscore', async () => {
    await testUsernameValidation('_testuser', userNameErrors.charsError);
  });

  it('should display error for username ending with dash', async () => {
    await testUsernameValidation('testuser-', userNameErrors.charsError);
  });

  it('should display error for username with spaces', async () => {
    await testUsernameValidation('test user', userNameErrors.spacesError);
  });

  it('should display error for username with tabs', async () => {
    await testUsernameValidation('test\tuser', userNameErrors.spacesError);
  });

  it('should display error for username with special characters', async () => {
    await testUsernameValidation('test@user', userNameErrors.charsError);
  });

  it('should display error for non-ASCII characters', async () => {
    await testUsernameValidation('tëstuser', userNameErrors.nonAsciiError);
  });

  describe('Valid usernames', () => {
    const testValidUsername = async (username: string) => {
      const { queryByText } = renderWithTheme(<CreateUserDrawer {...props} />);

      const { emailInput, usernameInput } = await getDrawerInputs();

      await userEvent.type(usernameInput, username);
      await userEvent.type(emailInput, validEmail);
      await userEvent.click(usernameInput);
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(
        queryByText(/Username must be between 3 and 32 characters/)
      ).not.toBeInTheDocument();
      expect(
        queryByText(
          /Username must not include two dashes or underscores in a row/
        )
      ).not.toBeInTheDocument();
      expect(
        queryByText(
          /Username may only contain letters, numbers, dashes, and underscores/
        )
      ).not.toBeInTheDocument();
      expect(
        queryByText(/Username may not contain spaces or tabs/)
      ).not.toBeInTheDocument();
      expect(
        queryByText(/Username must only use ASCII characters/)
      ).not.toBeInTheDocument();
    };

    it('should accept valid username with letters and numbers', async () => {
      await testValidUsername('testuser123');
    });

    it('should accept valid username with underscores', async () => {
      await testValidUsername('test_user');
    });

    it('should accept valid username with dashes', async () => {
      await testValidUsername('test-user');
    });

    it('should accept valid username with mixed case', async () => {
      await testValidUsername('TestUser');
    });

    it('should accept valid username with numbers at start/end', async () => {
      await testValidUsername('1testuser2');
    });

    it('should accept minimum length username', async () => {
      await testValidUsername('abc');
    });

    it('should accept maximum length username', async () => {
      const maxUsername = 'a'.repeat(32);
      await testValidUsername(maxUsername);
    });
  });
});
