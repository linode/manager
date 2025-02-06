import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { alertFactory, notificationChannelFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import {
  convertAlertDefinitionValues,
  omitEditAlertFormValues,
} from '../Utils/utils';
import { EditAlertDefinition } from './EditAlertDefinition';

const queryMocks = vi.hoisted(() => ({
  useAllAlertNotificationChannelsQuery: vi.fn(),
  useEditAlertDefinition: vi.fn(),
}));

vi.mock('src/queries/cloudpulse/alerts', () => ({
  ...vi.importActual('src/queries/cloudpulse/alerts'),
  useAllAlertNotificationChannelsQuery:
    queryMocks.useAllAlertNotificationChannelsQuery,
  useEditAlertDefinition: queryMocks.useEditAlertDefinition,
}));

beforeEach(() => {
  vi.clearAllMocks();
  queryMocks.useEditAlertDefinition.mockReturnValue({
    mutateAsync: vi.fn().mockResolvedValue({}),
    reset: vi.fn(),
  });
  queryMocks.useAllAlertNotificationChannelsQuery.mockReturnValue(
    notificationChannelFactory.build()
  );
});

const alertDetails = alertFactory.build({
  rule_criteria: {
    rules: [
      {
        aggregate_function: 'avg',
        dimension_filters: [],
        metric: 'cpu_utilization',
        operator: 'gte',
        unit: 'percent',
      },
    ],
  },
  service_type: 'linode',
});
describe('EditAlertDefinition component', () => {
  it('renders the components of the form', async () => {
    const {
      findByPlaceholderText,
      getByLabelText,
      getByText,
    } = renderWithTheme(
      <EditAlertDefinition alertDetails={alertDetails} serviceType={'linode'} />
    );
    expect(getByText('1. General Information')).toBeVisible();
    expect(getByLabelText('Name')).toBeVisible();
    expect(getByLabelText('Description (optional)')).toBeVisible();
    expect(getByLabelText('Severity')).toBeVisible();
    expect(getByLabelText('Service')).toBeVisible();
    expect(getByText('2. Resources')).toBeVisible();
    expect(
      await findByPlaceholderText('Search for a Region or Resource')
    ).toBeInTheDocument();
    expect(await findByPlaceholderText('Select Regions')).toBeInTheDocument();
    expect(getByText('3. Criteria')).toBeVisible();
    expect(getByText('Metric Threshold')).toBeVisible();
    expect(getByLabelText('Data Field')).toBeVisible();
    expect(getByLabelText('Aggregation Type')).toBeVisible();
    expect(getByLabelText('Operator')).toBeVisible();
    expect(getByLabelText('Threshold')).toBeVisible();
    expect(getByLabelText('Evaluation Period')).toBeVisible();
    expect(getByLabelText('Polling Interval')).toBeVisible();
    expect(getByText('4. Notification Channels')).toBeVisible();
  });

  it('should submit form data correctly', async () => {
    const mutateAsyncSpy = queryMocks.useEditAlertDefinition().mutateAsync;
    const alertDetails = alertFactory.build({ service_type: 'linode' });
    const { getByPlaceholderText, getByText } = renderWithTheme(
      <EditAlertDefinition alertDetails={alertDetails} serviceType={'linode'} />
    );
    const descriptionValue = 'Updated Description';
    const nameValue = 'Updated Label';
    const nameInput = getByPlaceholderText('Enter Name');
    const descriptionInput = getByPlaceholderText('Enter Description');
    await userEvent.clear(nameInput);
    await userEvent.clear(descriptionInput);
    await userEvent.type(nameInput, nameValue);

    await userEvent.type(descriptionInput, descriptionValue);

    await userEvent.click(getByText('Submit'));
    const alertPayload = convertAlertDefinitionValues(
      {
        ...alertDetails,
        description: descriptionValue,
        label: nameValue,
      },
      'linode'
    );
    await waitFor(() =>
      expect(mutateAsyncSpy).toHaveBeenCalledWith(
        expect.objectContaining(omitEditAlertFormValues(alertPayload))
      )
    );
  });
});
