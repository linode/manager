import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CreateAlertDefinition } from './CreateAlertDefinition';
vi.mock('src/queries/cloudpulse/resources', () => ({
  ...vi.importActual('src/queries/cloudpulse/resources'),
  useResourcesQuery: queryMocks.useResourcesQuery,
}));

vi.mock('@linode/queries', async (importOriginal) => ({
  ...(await importOriginal()),
  useRegionsQuery: queryMocks.useRegionsQuery,
}));

const queryMocks = vi.hoisted(() => ({
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  queryMocks.useResourcesQuery.mockReturnValue({
    data: [],
    isError: false,
    isFetching: false,
  });
  queryMocks.useRegionsQuery.mockReturnValue({
    data: [],
    isError: false,
    isFetching: false,
  });
});

describe('AlertDefinition Create', () => {
  it('should render input components', async () => {
    const { getByLabelText, getByPlaceholderText, getByText } = renderWithTheme(
      <CreateAlertDefinition />
    );

    expect(getByText('1. General Information')).toBeVisible();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
    expect(getByLabelText('Service')).toBeVisible();
    expect(getByText('2. Resources')).toBeVisible();
    await expect(
      getByPlaceholderText('Search for a Region or Resource')
    ).toBeInTheDocument();
    await expect(getByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByText('3. Criteria')).toBeVisible();
    expect(getByText('Metric Threshold')).toBeVisible();
    expect(getByLabelText('Data Field')).toBeVisible();
    expect(getByLabelText('Aggregation Type')).toBeVisible();
    expect(getByLabelText('Operator')).toBeVisible();
    expect(getByLabelText('Threshold')).toBeVisible();
    expect(getByText('4. Notification Channels')).toBeVisible();
    expect(getByLabelText('Evaluation Period')).toBeVisible();
    expect(getByLabelText('Polling Interval')).toBeVisible();
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
    const errorMessage = 'This field is required.';
    const user = userEvent.setup();
    const container = renderWithTheme(<CreateAlertDefinition />);
    const input = container.getByLabelText('Threshold');
    await user.click(
      container.getByRole('button', { name: 'Add dimension filter' })
    );
    const submitButton = container.getByText('Submit');
    await user.click(submitButton!);
    expect(container.getAllByText('This field is required.').length).toBe(11);
    container.getAllByText(errorMessage).forEach((element) => {
      expect(element).toBeVisible();
    });

    await user.clear(input);
    await user.type(input, '-3');
    await userEvent.click(submitButton!);

    expect(
      await container.findByText("The value can't be negative.")
    ).toBeVisible();

    await user.clear(input);
    await user.type(input, 'sdgf');
    await userEvent.click(submitButton!);

    expect(
      await container.findByText('The value should be a number.')
    ).toBeInTheDocument();

    expect(
      await container.findByText(
        'At least one notification channel is required.'
      )
    );
  });

  it('should validate the checks of Alert Name and Description', async () => {
    const user = userEvent.setup();
    const container = renderWithTheme(<CreateAlertDefinition />);
    const nameInput = container.getByLabelText('Name');
    const descriptionInput = container.getByLabelText('Description (optional)');
    await user.type(nameInput, '*#&+:<>"?@%');
    await user.type(
      descriptionInput,
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    );
    await user.click(container.getByText('Submit'));
    expect(
      await container.findByText(
        'Name cannot contain special characters: * # & + : < > ? @ % { } \\ /.'
      )
    ).toBeVisible();
    expect(
      await container.findByText('Description must be 100 characters or less.')
    ).toBeVisible();
  });
});
