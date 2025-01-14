import React from 'react';

import { dashboardFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardFilterBuilder } from './CloudPulseDashboardFilterBuilder';

describe('CloudPulseDashboardFilterBuilder component tests', () => {
  it('it should render successfully when the required props are passed for service type linode', () => {
    const { getByTestId } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'linode',
        })}
        emitFilterChange={vi.fn()}
        isServiceAnalyticsIntegration={false}
      />
    );

    expect(getByTestId('resource-select')).toBeDefined();
    expect(getByTestId('region-select')).toBeDefined();
  });

  it('it should render successfully when the required props are passed for service type dbaas', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'dbaas',
        })}
        emitFilterChange={vi.fn()}
        isServiceAnalyticsIntegration={false}
      />
    );

    expect(getByPlaceholderText('Select a Database Engine')).toBeDefined();
    expect(getByPlaceholderText('Select a Region')).toBeDefined();
  });
});
