import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { SingleTextFieldForm } from './SingleTextFieldForm';

describe('SingleTextFieldForm', () => {
  const props = {
    initialValue: 'jane-doe',
    label: 'Username',
    submitForm: vi.fn(() => Promise.resolve()),
  };

  it('Renders a TextField with the given label and initial value', () => {
    renderWithTheme(<SingleTextFieldForm {...props} />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane-doe')).toBeInTheDocument();
  });

  it('Renders a success message on success', async () => {
    renderWithTheme(<SingleTextFieldForm {...props} />);
    userEvent.type(screen.getByTestId('textfield-input'), 'new-value');
    userEvent.click(screen.getByText('Update Username'));
    await waitFor(() =>
      expect(screen.getByText(/username updated/i)).toBeInTheDocument()
    );
  });

  it('Renders an error message on error', async () => {
    renderWithTheme(
      <SingleTextFieldForm
        {...props}
        submitForm={vi.fn(() =>
          Promise.reject([{ reason: 'Error updating username.' }])
        )}
      />
    );
    userEvent.type(screen.getByTestId('textfield-input'), 'new-value');
    userEvent.click(screen.getByText('Update Username'));
    await waitFor(() =>
      expect(screen.getByText(/error updating/i)).toBeInTheDocument()
    );
  });

  it('Calls submitForm function with new value', () => {
    renderWithTheme(<SingleTextFieldForm {...props} />);
    const input = screen.getByTestId('textfield-input');
    fireEvent.change(input, { target: { value: 'my-new-username' } });
    expect(screen.getByDisplayValue('my-new-username')).toBeInTheDocument();
  });
});
