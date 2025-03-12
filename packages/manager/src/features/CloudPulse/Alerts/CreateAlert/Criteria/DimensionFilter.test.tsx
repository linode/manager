import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { DimensionFilters } from './DimensionFilter';

import type { CreateAlertDefinitionForm, DimensionFilterForm } from '../types';
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
const dimensionFilterButton = 'Add dimension filter';
describe('DimensionFilterField', () => {
  const user = userEvent.setup();

  it('render the fields properly', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilters
            dataFieldDisabled={true}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters`}
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
    expect(screen.getByText('Dimension Filter')).toBeVisible();
    expect(screen.getByText('(optional)')).toBeVisible();
    await user.click(
      container.getByRole('button', { name: 'Add dimension filter' })
    );
    expect(screen.getByLabelText('Data Field')).toBeVisible();
    expect(screen.getByLabelText('Operator')).toBeVisible();
    expect(screen.getByLabelText('Value')).toBeVisible();
  });

  it('does not render the dimension filed directly with Metric component', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilters
            dataFieldDisabled={true}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters`}
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
    const dimensionFilterID = 'rule_criteria.rules.0.dimension_filters.0-id';
    expect(container.queryByTestId(dimensionFilterID)).not.toBeInTheDocument();
  });

  it('adds and removes dimension filter fields dynamically', async () => {
    const container = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>(
      {
        component: (
          <DimensionFilters
            dataFieldDisabled={true}
            dimensionOptions={mockData[0].dimensions}
            name={`rule_criteria.rules.${0}.dimension_filters`}
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

    const dimensionFilterID = 'rule_criteria.rules.0.dimension_filters.1-id';
    await user.click(
      container.getByRole('button', { name: dimensionFilterButton })
    );
    await user.click(
      container.getByRole('button', { name: dimensionFilterButton })
    );
    expect(container.getByTestId(dimensionFilterID)).toBeInTheDocument();
    await user.click(
      within(container.getByTestId(dimensionFilterID)).getByTestId('clear-icon')
    );
    await waitFor(() =>
      expect(container.queryByTestId(dimensionFilterID)).not.toBeInTheDocument()
    );
  });
  it('should show tooltip when the max limit of dimension filters is reached', async () => {
    const dimensionFilterValue: DimensionFilterForm = {
      dimension_label: 'state',
      operator: 'eq',
      value: 'free',
    };
    const {
      getByText,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <DimensionFilters
          dataFieldDisabled={true}
          dimensionOptions={mockData[0].dimensions}
          name={`rule_criteria.rules.${0}.dimension_filters`}
        />
      ),
      useFormOptions: {
        defaultValues: {
          rule_criteria: {
            rules: [
              {
                ...mockData[0],
                dimension_filters: Array(5).fill(dimensionFilterValue),
              },
            ],
          },
          serviceType: 'linode',
        },
      },
    });
    const addButton = screen.getByRole('button', {
      name: dimensionFilterButton,
    });
    expect(addButton).toBeDisabled();
    userEvent.hover(addButton);
    await waitFor(() =>
      expect(
        getByText('You can add up to 5 dimension filters.')
      ).toBeInTheDocument()
    );
  });
});
