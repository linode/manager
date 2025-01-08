import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DimensionOperatorOptions } from '../../constants';
import { DimensionFilterField } from './DimensionFilterField';

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
    label: 'CPU utilization',
    metric: 'system_cpu_utilization_percent',
    metric_type: 'gauge',
    scrape_interval: '2m',
    unit: 'percent',
  },
];

const dimensionFieldMockData = mockData[0].dimensions;
describe('Dimension filter field component', () => {
  const user = userEvent.setup();
  it('should render all the components and names', () => {
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <DimensionFilterField
          dataFieldDisabled={false}
          dimensionOptions={dimensionFieldMockData}
          name={`rule_criteria.rules.${0}.dimension_filters.${0}`}
          onFilterDelete={vi.fn()}
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
    });
    expect(screen.getByLabelText('Data Field')).toBeVisible();
    expect(screen.getByLabelText('Operator')).toBeVisible();
    expect(screen.getByLabelText('Value')).toBeVisible();
  });

  it('should render the Data Field component with options happy path and select an option', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilterField
            dataFieldDisabled={false}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters.${0}`}
            onFilterDelete={vi.fn()}
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
    const dataFieldContainer = container.getByTestId('data-field');
    const dataFieldInput = within(dataFieldContainer).getByRole('button', {
      name: 'Open',
    });
    await user.click(dataFieldInput);
    expect(
      await container.findByRole('option', {
        name: dimensionFieldMockData[0].label,
      })
    ).toBeInTheDocument();
    expect(
      await container.findByRole('option', {
        name: dimensionFieldMockData[1].label,
      })
    ).toBeInTheDocument();
    await user.click(
      container.getByRole('option', { name: dimensionFieldMockData[0].label })
    );
    expect(within(dataFieldContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      dimensionFieldMockData[0].label
    );
  });

  it('should render the Operator component', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilterField
            dataFieldDisabled={false}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters.${0}`}
            onFilterDelete={vi.fn()}
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
      await container.findByRole('option', {
        name: DimensionOperatorOptions[1].label,
      })
    );

    await user.click(
      await container.findByRole('option', {
        name: DimensionOperatorOptions[0].label,
      })
    );

    expect(within(operatorContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      DimensionOperatorOptions[0].label
    );
  });

  it('should render the Value component with options happy path and select an option', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilterField
            dataFieldDisabled={false}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters.${0}`}
            onFilterDelete={vi.fn()}
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
    const dataFieldContainer = container.getByTestId('data-field');
    const dataFieldInput = within(dataFieldContainer).getByRole('button', {
      name: 'Open',
    });
    await user.click(dataFieldInput);
    await user.click(
      await container.findByRole('option', {
        name: dimensionFieldMockData[1].label,
      })
    );
    const valueContainer = container.getByTestId('value');
    const valueInput = within(valueContainer).getByRole('button', {
      name: 'Open',
    });

    user.click(valueInput);
    expect(
      await container.findByRole('option', {
        name: dimensionFieldMockData[1].values[0],
      })
    );

    expect(
      await container.findByRole('option', {
        name: dimensionFieldMockData[1].values[1],
      })
    );

    await user.click(
      container.getByRole('option', {
        name: dimensionFieldMockData[1].values[0],
      })
    );

    expect(within(valueContainer).getByRole('combobox')).toHaveAttribute(
      'value',
      dimensionFieldMockData[1].values[0]
    );
  });
});
