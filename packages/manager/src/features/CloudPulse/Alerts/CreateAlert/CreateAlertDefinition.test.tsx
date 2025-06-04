import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { ACCOUNT_GROUP_INFO_MESSAGE } from '../constants';
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
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
  useGetCloudPulseMetricDefinitionsByServiceType: vi.fn().mockReturnValue({}),
  useRegionsQuery: vi.fn(),
  useResourcesQuery: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPullMetricDefinitionsByServiceType:
      queryMocks.useGetCloudPulseMetricDefinitionsByServiceType,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
    data: [],
    isError: false,
    isLoading: false,
  });
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
  queryMocks.useCloudPulseServiceTypes.mockReturnValue({
    data: { data: [{ label: 'Linode', service_type: 'linode' }] },
    isError: false,
    isLoading: false,
    status: 'success',
  });
});

describe('AlertDefinition Create', () => {
  it('should render input components', async () => {
    renderWithTheme(<CreateAlertDefinition />);

    expect(screen.getByText('1. General Information')).toBeVisible();
    expect(screen.getByLabelText('Name')).toBeVisible();
    expect(screen.getByLabelText('Description (optional)')).toBeVisible();
    expect(screen.getByLabelText('Severity')).toBeVisible();
    expect(screen.getByLabelText('Service')).toBeVisible();
    expect(screen.getByText('2. Account')).toBeVisible();
    expect(screen.getByText(ACCOUNT_GROUP_INFO_MESSAGE)).toBeVisible();
    expect(screen.getByText('3. Criteria')).toBeVisible();
    expect(screen.getByText('Metric Threshold')).toBeVisible();
    expect(screen.getByLabelText('Data Field')).toBeVisible();
    expect(screen.getByLabelText('Aggregation Type')).toBeVisible();
    expect(screen.getByLabelText('Operator')).toBeVisible();
    expect(screen.getByLabelText('Threshold')).toBeVisible();
    expect(screen.getByText('4. Notification Channels')).toBeVisible();
    expect(screen.getByLabelText('Evaluation Period')).toBeVisible();
    expect(screen.getByLabelText('Polling Interval')).toBeVisible();
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

  queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
    data: {
      data: [
        {
          available_aggregate_functions: ['min'],
          dimensions: [],
          is_alertable: true,
          label: 'CPU utilization',
          metric: 'system_cpu_utilization_percent',
          metric_type: 'gauge',
          scrape_interval: '2m',
          unit: 'percent',
        },
      ],
    },
  });
  it('should render client side validation errors for threshold and trigger occurences text field', async () => {
    const user = userEvent.setup();
    const container = renderWithTheme(<CreateAlertDefinition />);

    const serviceTypeInput = container.getByPlaceholderText('Select a Service');
    await user.click(serviceTypeInput);

    await user.click(container.getByText('Linode'));

    const dataFieldContainer = container.getByPlaceholderText(
      'Select a Data Field'
    );

    await user.click(dataFieldContainer);
    await user.click(container.getByText('CPU utilization'));

    const submitButton = container.getByText('Submit');

    await user.click(submitButton);

    expect(container.getAllByText('Enter a positive value.').length).toBe(2);

    const thresholdInput = container.getByLabelText('Threshold');
    const triggerOccurrences = container.getByTestId('trigger-occurences');
    await user.clear(thresholdInput);
    await user.clear(within(triggerOccurrences).getByTestId('textfield-input'));
    await user.click(submitButton!);

    expect(container.getAllByText('The value should be a number.').length).toBe(
      2
    );
  });

  it('should render the client side validation error messages for the form', async () => {
    const errorMessage = 'This field is required.';
    const user = userEvent.setup();
    const container = renderWithTheme(<CreateAlertDefinition />);

    const submitButton = container.getByText('Submit');

    await user.click(
      container.getByRole('button', { name: 'Add dimension filter' })
    );

    await user.click(submitButton!);
    expect(container.getAllByText(errorMessage).length).toBe(12);
    container.getAllByText(errorMessage).forEach((element) => {
      expect(element).toBeVisible();
    });

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
