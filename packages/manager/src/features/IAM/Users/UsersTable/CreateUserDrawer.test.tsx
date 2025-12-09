import { userNameErrors } from '@linode/validation';
import { fireEvent } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

import { http, HttpResponse, server } from 'src/mocks/testServer';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateUserDrawer } from './CreateUserDrawer';

const props = {
  onClose: vi.fn(),
  open: true,
};

const testEmail = 'testuser@example.com';

describe('CreateUserDrawer', () => {
  it('should render the drawer when open is true', () => {
    const { getByRole } = renderWithTheme(<CreateUserDrawer {...props} />);

    const dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();
  });

  it('should allow the user to fill out the form', () => {
    const { getByLabelText, getByRole } = renderWithTheme(
      <CreateUserDrawer {...props} />
    );

    const dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.change(getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(getByLabelText(/email/i), {
      target: { value: testEmail },
    });

    expect(getByLabelText(/username/i)).toHaveValue('testuser');
    expect(getByLabelText(/email/i)).toHaveValue(testEmail);
  });

  it('should display an error message when submission fails', async () => {
    server.use(
      http.post('*/account/users', () => {
        return HttpResponse.json(
          { error: [{ reason: 'An unexpected error occurred.' }] },
          { status: 500 }
        );
      })
    );

    const { findByText, getByLabelText, getByRole, getByTestId } =
      renderWithTheme(<CreateUserDrawer {...props} />);

    const dialog = getByRole('dialog');
    expect(dialog).toBeInTheDocument();

    fireEvent.change(getByLabelText(/username/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(getByLabelText(/email/i), {
      target: { value: testEmail },
    });
    fireEvent.click(getByTestId('submit'));

    const errorMessage = await findByText('An unexpected error occurred.');
    expect(errorMessage).toBeInTheDocument();
  });
});

describe('CreateUserDrawer - Username Validation', () => {
  const validEmail = 'test@example.com';

  const testUsernameValidation = async (
    username: string,
    expectedError: string
  ) => {
    const { findByText, getByLabelText, getByTestId } = renderWithTheme(
      <CreateUserDrawer {...props} />
    );

    await userEvent.type(getByLabelText(/username/i), username);
    await userEvent.type(getByLabelText(/email/i), validEmail);
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
      const { queryByText, getByLabelText } = renderWithTheme(
        <CreateUserDrawer {...props} />
      );

      await userEvent.type(getByLabelText(/username/i), username);
      await userEvent.type(getByLabelText(/email/i), validEmail);
      await userEvent.click(getByLabelText(/username/i));
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
