import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { Metric } from './Metric';

import type { CreateAlertDefinitionForm } from '../types';
import type { MetricDefinition } from '@linode/api-v4';
const mockData: MetricDefinition[] = [
  {
    available_aggregate_functions: ['min', 'max', 'avg'],
    dimensions: [
      {
        dimension_label: 'cpu',
        label: 'CPU name',
        values: [],
      },
      {
        dimension_label: 'state',
        label: 'State of CPU',
        values: [
          'user',
          'system',
          'idle',
          'interrupt',
          'nice',
          'softirq',
          'steal',
          'wait',
        ],
      },
      {
        dimension_label: 'LINODE_ID',
        label: 'Linode ID',
        values: [],
      },
    ],
    is_alertable: true,
    label: 'CPU utilization',
    metric: 'system_cpu_utilization_percent',
    metric_type: 'gauge',
    scrape_interval: '2m',
    unit: 'percent',
  },
];

describe('Metric component tests', () => {
  const user = userEvent.setup();
  it('should render all the components and names', () => {
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <Metric
          data={mockData}
          isMetricDefinitionError={false}
          isMetricDefinitionLoading={false}
          name={`rule_criteria.rules.${0}`}
          onMetricDelete={vi.fn()}
          showDeleteIcon={false}
        />
      ),
      useFormOptions: {
        defaultValues: {
          serviceType: 'linode',
        },
      },
    });
    expect(screen.getByLabelText('Data Field')).toBeVisible();
    expect(screen.getByLabelText('Aggregation Type')).toBeVisible();
    expect(screen.getByLabelText('Operator')).toBeVisible();
    expect(screen.getByLabelText('Threshold')).toBeVisible();
  });

  it('should render the Data Field component with options happy path and select an option', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <Metric
            data={mockData}
            isMetricDefinitionError={false}
            isMetricDefinitionLoading={false}
            name={`rule_criteria.rules.${0}`}
            onMetricDelete={vi.fn()}
            showDeleteIcon={false}
          />
        ),
        useFormOptions: {
          defaultValues: {
            serviceType: 'linode',
          },
        },
      }
    );
    const dataFieldContainer = container.getByTestId('data-field');
    expect(
      within(dataFieldContainer).getByRole('button', {
        name:
          'Represents the metric you want to receive alerts for. Choose the one that helps you evaluate performance of your service in the most efficient way. For multiple metrics we use the AND method by default.',
      })
    );
    const dataFieldInput = within(dataFieldContainer).getByRole('button', {
      name: 'Open',
    });
    user.click(dataFieldInput);

    expect(
      await container.findByRole('option', { name: mockData[0].label })
    ).toBeInTheDocument();

    await user.click(
      container.getByRole('option', { name: mockData[0].label })
    );
    expect(within(dataFieldContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      mockData[0].label
    );
  });

  it('should render the Aggregation Type component', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <Metric
            data={mockData}
            isMetricDefinitionError={false}
            isMetricDefinitionLoading={false}
            name={`rule_criteria.rules.${0}`}
            onMetricDelete={vi.fn()}
            showDeleteIcon={false}
          />
        ),
        useFormOptions: {
          defaultValues: {
            rule_criteria: {
              rules: [mockData[0]],
            },
            serviceType: 'linode',
          },
        },
      }
    );

    const aggregationTypeContainer = container.getByTestId('aggregation-type');
    const aggregationTypeInput = within(
      aggregationTypeContainer
    ).getByRole('button', { name: 'Open' });

    user.click(aggregationTypeInput);

    expect(
      await container.findByRole('option', { name: 'Minimum' })
    ).toBeInTheDocument();

    expect(
      container.getByRole('option', { name: 'Average' })
    ).toBeInTheDocument();

    const option = await container.findByRole('option', { name: 'Average' });

    await user.click(option);
    expect(
      within(aggregationTypeContainer).getByRole('combobox')
    ).toHaveAttribute('value', 'Average');
  });

  it('should render the Operator component', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <Metric
            data={mockData}
            isMetricDefinitionError={false}
            isMetricDefinitionLoading={false}
            name={`rule_criteria.rules.${0}`}
            onMetricDelete={vi.fn()}
            showDeleteIcon={false}
          />
        ),
        useFormOptions: {
          defaultValues: {
            rule_criteria: {
              rules: [mockData[0]],
            },
            serviceType: 'linode',
          },
        },
      }
    );
    const operatorContainer = container.getByTestId('operator');
    const operatorInput = within(operatorContainer).getByRole('button', {
      name: 'Open',
    });

    user.click(operatorInput);
    expect(
      await container.findByRole('option', { name: '>' })
    ).toBeInTheDocument();
    expect(container.getByRole('option', { name: '==' })).toBeInTheDocument();
    expect(container.getByRole('option', { name: '<' })).toBeInTheDocument();
    const option = await container.findByRole('option', { name: '>' });
    await user.click(option);

    expect(within(operatorContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      '>'
    );
  });

  it('should render the Threshold component', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <Metric
            data={mockData}
            isMetricDefinitionError={false}
            isMetricDefinitionLoading={false}
            name={`rule_criteria.rules.${0}`}
            onMetricDelete={vi.fn()}
            showDeleteIcon={false}
          />
        ),
        useFormOptions: {
          defaultValues: {
            serviceType: 'linode',
          },
        },
      }
    );

    const input = container.getByLabelText('Threshold');
    await user.clear(input);
    await user.type(input, '3');
    const thresholdInput = within(
      container.getByTestId('threshold')
    ).getByTestId('textfield-input');
    expect(container.getByDisplayValue('3')).toBeInTheDocument();
    expect(thresholdInput.getAttribute('type')).toBe('number');
  });
});
