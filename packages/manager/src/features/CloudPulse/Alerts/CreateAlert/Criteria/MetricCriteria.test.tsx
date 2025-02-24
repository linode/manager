import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { convertToSeconds } from '../utilities';
import { MetricCriteriaField } from './MetricCriteria';

import type { CreateAlertDefinitionForm } from '../types';
import type { MetricDefinition, ResourcePage } from '@linode/api-v4';

const queryMocks = vi.hoisted(() => ({
  useGetCloudPulseMetricDefinitionsByServiceType: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useGetCloudPulseMetricDefinitionsByServiceType:
      queryMocks.useGetCloudPulseMetricDefinitionsByServiceType,
  };
});

const mockData: ResourcePage<MetricDefinition> = {
  data: [
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
    {
      available_aggregate_functions: ['min', 'max', 'avg', 'sum'],
      dimensions: [
        {
          dimension_label: 'state',
          label: 'State of memory',
          values: [
            'used',
            'free',
            'buffered',
            'cached',
            'slab_reclaimable',
            'slab_unreclaimable',
          ],
        },
        {
          dimension_label: 'LINODE_ID',
          label: 'Linode ID',
          values: [],
        },
      ],
      is_alertable: true,
      label: 'Memory Usage',
      metric: 'system_memory_usage_by_resource',
      metric_type: 'gauge',
      scrape_interval: '30s',
      unit: 'byte',
    },
  ],
  page: 1,
  pages: 1,
  results: 2,
};

queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
  data: mockData,
  isError: false,
  isLoading: false,
  status: 'success',
});

describe('MetricCriteriaField', () => {
  const user = userEvent.setup();
  it('renders correctly', () => {
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <MetricCriteriaField
          name="rule_criteria.rules"
          serviceType="linode"
          setMaxInterval={vi.fn()}
        />
      ),
      useFormOptions: {
        defaultValues: {
          rule_criteria: {
            rules: [mockData.data[0]],
          },
        },
      },
    });
    expect(screen.getByText('3. Criteria')).toBeVisible();
    expect(screen.getByText('Metric Threshold')).toBeVisible();
    expect(screen.getByLabelText('Data Field')).toBeVisible();
    expect(screen.getByLabelText('Aggregation Type')).toBeVisible();
    expect(screen.getByLabelText('Operator')).toBeVisible();
    expect(screen.getByLabelText('Threshold')).toBeVisible();
  });

  it('renders the initial metric field without the delete-icon', async () => {
    const {
      getByTestId,
      queryByTestId,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <MetricCriteriaField
          name="rule_criteria.rules"
          serviceType="linode"
          setMaxInterval={vi.fn()}
        />
      ),
      useFormOptions: {
        defaultValues: {
          rule_criteria: {
            rules: [mockData.data[0]],
          },
        },
      },
    });
    expect(getByTestId('rule_criteria.rules.0-id')).toBeInTheDocument();
    await waitFor(() =>
      expect(queryByTestId('clear-icon')).not.toBeInTheDocument()
    );
  });

  it('handles error state while fetching metric definitions', async () => {
    // Mock the API to simulate error state
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: undefined,
      isError: true,
      isLoading: false,
      status: 'error',
    }),
      renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
        component: (
          <MetricCriteriaField
            name="rule_criteria.rules"
            serviceType="linode"
            setMaxInterval={vi.fn()}
          />
        ),
        useFormOptions: {
          defaultValues: {
            rule_criteria: {
              rules: [mockData.data[0]],
            },
          },
        },
      });
    expect(
      await screen.findByText('Error in fetching the data.')
    ).toBeInTheDocument();
  });

  it('adds and removes metric fields dynamically', async () => {
    const {
      getByTestId,
      queryByTestId,
    } = renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <MetricCriteriaField
          name="rule_criteria.rules"
          serviceType="linode"
          setMaxInterval={vi.fn()}
        />
      ),
      useFormOptions: {
        defaultValues: {
          rule_criteria: {
            rules: [mockData.data[0]],
          },
        },
      },
    });
    const ruleCriteriaID = 'rule_criteria.rules.1-id';
    await user.click(screen.getByRole('button', { name: 'Add metric' }));
    expect(getByTestId(ruleCriteriaID)).toBeInTheDocument();
    await user.click(
      within(screen.getByTestId(ruleCriteriaID)).getByTestId('clear-icon')
    );
    await waitFor(() =>
      expect(queryByTestId(ruleCriteriaID)).not.toBeInTheDocument()
    );
  });

  it('setMaxInterval has to be called', async () => {
    queryMocks.useGetCloudPulseMetricDefinitionsByServiceType.mockReturnValue({
      data: mockData,
      isError: true,
      isLoading: false,
      status: 'error',
    });
    const setMaxInterval = vi.fn();
    const firstOption = mockData.data[0];
    const [firstOptionConvertedTime] = convertToSeconds([
      firstOption.scrape_interval,
    ]);
    renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
      component: (
        <MetricCriteriaField
          name="rule_criteria.rules"
          serviceType="linode"
          setMaxInterval={setMaxInterval}
        />
      ),
      useFormOptions: {
        defaultValues: {
          rule_criteria: {
            rules: [firstOption],
          },
        },
      },
    });

    expect(setMaxInterval).toBeCalledWith(firstOptionConvertedTime);
  });
});
