import * as React from 'react';
import SingleTextFieldForm, { Props } from './SingleTextFieldForm';
import { renderWithTheme } from 'src/utilities/testHelpers';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('SingleTextFieldForm', () => {
  const props: Props = {
    label: 'Username',
    submitForm: jest.fn(() => Promise.resolve()),
    initialValue: 'jane-doe',
  };

  it('Renders a TextField with the given label and initial value', () => {
    renderWithTheme(<SingleTextFieldForm {...props} />);
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane-doe')).toBeInTheDocument();
  });

  it('Renders a success message on success', async () => {
    renderWithTheme(<SingleTextFieldForm {...props} />);
    userEvent.type(screen.getByTestId('textfield-input'), 'new-value');
    userEvent.click(screen.getByText('Save'));
    await waitFor(() =>
      expect(screen.getByText(/username updated/i)).toBeInTheDocument()
    );
  });

  it('Renders an error message on error', async () => {
    renderWithTheme(
      <SingleTextFieldForm
        {...props}
        submitForm={jest.fn(() =>
          Promise.reject([{ reason: 'Error updating username.' }])
        )}
      />
    );
    userEvent.type(screen.getByTestId('textfield-input'), 'new-value');
    userEvent.click(screen.getByText('Save'));
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
