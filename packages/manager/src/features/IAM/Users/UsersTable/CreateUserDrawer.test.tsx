import { fireEvent } from '@testing-library/react';
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
