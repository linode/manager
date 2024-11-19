import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAlertDefinition } from './CreateAlertDefinition';
describe('AlertDefinition Create', () => {
  it('should render input components', () => {
    const { getByLabelText } = renderWithTheme(<CreateAlertDefinition />);

    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
  });
  it('should be able to enter a value in the textbox', () => {
    const { getByLabelText } = renderWithTheme(<CreateAlertDefinition />);
    const input = getByLabelText('Name');

    fireEvent.change(input, { target: { value: 'text' } });
    const specificInput = within(screen.getByTestId('alert-name')).getByTestId(
      'textfield-input'
    );
    expect(specificInput).toHaveAttribute('value', 'text');
  });
  it('should render client side validation errors', async () => {
    const { getByText } = renderWithTheme(<CreateAlertDefinition />);

    const submitButton = getByText('Submit').closest('button');

    await userEvent.click(submitButton!);

    expect(getByText('Name is required.')).toBeVisible();
    expect(getByText('Severity is required.')).toBeVisible();
    expect(getByText('Service is required.')).toBeVisible();
    expect(getByText('Region is required.')).toBeVisible();
  });
});
