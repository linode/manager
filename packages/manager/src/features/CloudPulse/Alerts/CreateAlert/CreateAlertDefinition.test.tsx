import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAlertDefinition } from './CreateAlertDefinition';
describe('AlertDefinition Create', () => {
  it('should render input components', async () => {
    const { getByLabelText, getByText } = renderWithTheme(
      <CreateAlertDefinition />
    );

    expect(getByText('1. General Information')).toBeVisible();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
    expect(getByLabelText('Service')).toBeVisible();
    expect(getByLabelText('Region')).toBeVisible();
    expect(getByLabelText('Resources')).toBeVisible();
    expect(getByText('2. Criteria')).toBeVisible();
    expect(getByText('Metric Threshold')).toBeVisible();
    expect(getByLabelText('Data Field')).toBeVisible();
    expect(getByLabelText('Aggregation Type')).toBeVisible();
    expect(getByLabelText('Operator')).toBeVisible();
    expect(getByLabelText('Threshold')).toBeVisible();
  });

  it('should be able to enter a value in the textbox', async () => {
    const { getByLabelText } = renderWithTheme(<CreateAlertDefinition />);
    const input = getByLabelText('Name');

    await userEvent.type(input, 'text');
    const specificInput = within(screen.getByTestId('alert-name')).getByTestId(
      'textfield-input'
    );
    expect(specificInput).toHaveAttribute('value', 'text');
  });

  it('should render client side validation errors', async () => {
    const user = userEvent.setup();
    const container = renderWithTheme(<CreateAlertDefinition />);
    const input = container.getByLabelText('Threshold');
    const submitButton = container.getByText('Submit').closest('button');

    await userEvent.click(submitButton!);

    expect(container.getByText('Name is required.')).toBeVisible();
    expect(container.getByText('Severity is required.')).toBeVisible();
    expect(container.getByText('Service is required.')).toBeVisible();
    expect(container.getByText('Region is required.')).toBeVisible();
    expect(
      container.getByText('At least one resource is needed.')
    ).toBeVisible();
    expect(container.getByText('Metric Data Field is required.')).toBeVisible();
    expect(container.getByText('Aggregation type is required.')).toBeVisible();
    expect(container.getByText('Criteria Operator is required.')).toBeVisible();

    await user.clear(input);
    await user.type(input, '-3');
    await userEvent.click(submitButton!);

    expect(
      await container.findByText('Threshold value cannot be negative.')
    ).toBeVisible();

    await user.clear(input);
    await user.type(input, 'sdgf');
    await userEvent.click(submitButton!);

    expect(
      await container.findByText('Threshold value should be a number.')
    ).toBeInTheDocument();
  });
});
