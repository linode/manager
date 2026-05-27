import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

import { renderWithThemeAndHookFormContext } from 'src/utilities/testHelpers';

import { CloudPulseAlertsGroupBy } from './CloudPulseAlertsGroupBy';

import type { CreateAlertDefinitionForm } from '../../types';
import type { CloudPulseServiceType, MetricDefinition } from '@linode/api-v4';

const mockMetricDefinitions: MetricDefinition[] = [
  {
    available_aggregate_functions: ['min', 'max', 'avg'],
    dimensions: [
      {
        dimension_label: 'endpoint',
        label: 'Endpoint',
        values: [],
      },
      {
        dimension_label: 'region',
        label: 'Region',
        values: [],
      },
    ],
    is_alertable: true,
    label: 'Requests',
    metric: 'requests_total',
    metric_type: 'gauge',
    scrape_interval: '2m',
    unit: 'count',
  },
  {
    available_aggregate_functions: ['avg'],
    dimensions: [
      {
        dimension_label: 'endpoint',
        label: 'Endpoint',
        values: [],
      },
      {
        dimension_label: 'bucket',
        label: 'Bucket',
        values: [],
      },
    ],
    is_alertable: true,
    label: 'Storage Used',
    metric: 'storage_used_bytes',
    metric_type: 'gauge',
    scrape_interval: '5m',
    unit: 'bytes',
  },
];

const defaultProps = {
  metricDefinitions: mockMetricDefinitions,
  name: 'group_by' as const,
};

const renderGroupBy = (
  serviceType: CloudPulseServiceType | null,
  groupBy?: string[],
  enableGroupBy = true
) =>
  renderWithThemeAndHookFormContext<CreateAlertDefinitionForm>({
    component: <CloudPulseAlertsGroupBy {...defaultProps} />,
    useFormOptions: {
      defaultValues: {
        serviceType,
        group_by: groupBy,
      },
    },
    options: {
      flags: {
        aclpAlerting: {
          accountAlertLimit: 10,
          accountMetricLimit: 10,
          alertDefinitions: true,
          beta: true,
          enableGroupBy,
          notificationChannels: false,
          recentActivity: false,
        },
      },
    },
  });

describe('GroupBy component', () => {
  it('should not render when enableGroupBy flag is false', () => {
    const { queryByTestId } = renderGroupBy('linode', ['entity_id'], false);

    expect(queryByTestId('group-by-box')).not.toBeInTheDocument();
  });

  it('should render heading, description and disabled autocomplete when no serviceType', () => {
    const { getByLabelText, getByRole, getByText } = renderGroupBy(null);

    getByText('Group By');

    getByText(
      /Group by controls how alerts are grouped and evaluated based on selected metric dimensions\.\s*Entity is selected by default, but other dimensions can be selected\./i
    );

    getByLabelText('Dimensions');

    expect(getByRole('combobox')).toBeDisabled();
  });

  it('should deduplicate dimensions across metric definitions', async () => {
    const user = userEvent.setup();

    const { findAllByRole, getByRole } = renderGroupBy('linode', ['entity_id']);

    await user.click(
      getByRole('button', {
        name: 'Open',
      })
    );

    const endpointOptions = await findAllByRole('option', {
      name: 'Endpoint',
    });

    expect(endpointOptions).toHaveLength(1);
  });

  it('should not remove Entity chip for non-objectstorage', async () => {
    const { container } = renderGroupBy('linode', ['entity_id']);

    const deleteIcon = container.querySelector('.MuiChip-deleteIcon');

    expect(deleteIcon).toBeNull();
  });

  it('should allow removing Entity chip for objectstorage', async () => {
    const user = userEvent.setup();

    const { container, queryByRole } = renderGroupBy('objectstorage', [
      'entity_id',
    ]);

    const deleteIcon = container.querySelector('.MuiChip-deleteIcon');

    expect(deleteIcon).toBeTruthy();

    await user.click(deleteIcon!);

    await waitFor(() => {
      expect(
        queryByRole('button', {
          name: 'Entity',
        })
      ).not.toBeInTheDocument();
    });
  });

  it('should allow selecting additional dimensions', async () => {
    const user = userEvent.setup();

    const { findByRole, getByRole } = renderGroupBy('linode', ['entity_id']);

    await user.click(
      getByRole('button', {
        name: 'Open',
      })
    );

    await user.click(
      await findByRole('option', {
        name: 'Endpoint',
      })
    );

    expect(
      getByRole('button', {
        name: 'Endpoint',
      })
    ).toBeVisible();
  });

  it('should not overwrite pre-populated group_by on mount (Edit/Clone flow)', async () => {
    const { getByRole } = renderGroupBy('objectstorage', [
      'endpoint',
      'request_type',
    ]);

    await waitFor(() => {
      expect(
        getByRole('button', {
          name: 'Endpoint',
        })
      ).toBeVisible();

      expect(
        getByRole('button', {
          name: 'request_type',
        })
      ).toBeVisible();
    });
  });
});
