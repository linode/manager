import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardFilterBuilder } from './CloudPulseDashboardFilterBuilder';

const DASHBOARD = 'Test Metrics Dashboard';

describe('CloudPulseDashboardFilterBuilder component tests', () => {
  it('it should render successfully when the required props are passed for service type linode', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={{
          created: new Date().toDateString(),
          id: 1,
          label: DASHBOARD,
          service_type: 'linode',
          time_duration: { unit: 'min', value: 30 },
          updated: new Date().toDateString(),
          widgets: [],
        }}
        emitFilterChange={vi.fn()}
        isServiceAnalyticsIntegration={false}
      />
    );

    expect(getByTestId('resource-select')).toBeDefined();
    expect(getByTestId('region-select')).toBeDefined();
  });

  it('it should render successfully when the required props are passed for service type dbass', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={{
          created: new Date().toDateString(),
          id: 1,
          label: DASHBOARD,
          service_type: 'dbaas',
          time_duration: { unit: 'min', value: 30 },
          updated: new Date().toDateString(),
          widgets: [],
        }}
        emitFilterChange={vi.fn()}
        isServiceAnalyticsIntegration={false}
      />
    );

    expect(getByPlaceholderText('Select DB Cluster Names')).toBeDefined();
    expect(getByPlaceholderText('Select a Region')).toBeDefined();
  });
});
