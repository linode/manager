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
        handleToggleAppliedFilter={vi.fn()}
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
          id: 1,
        })}
        emitFilterChange={vi.fn()}
        handleToggleAppliedFilter={vi.fn()}
        isServiceAnalyticsIntegration={false}
        resource_ids={[1, 2]}
      />
    );

    expect(getByPlaceholderText('Select a Database Engine')).toBeDefined();
    expect(getByPlaceholderText('Select a Region')).toBeDefined();
    expect(getByPlaceholderText('Select Database Clusters')).toBeDefined();
    expect(getByPlaceholderText('Select a Node Type')).toBeDefined();
  });

  it('it should render successfully when the required props are passed for service type nodebalancer', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'nodebalancer',
          id: 3,
        })}
        emitFilterChange={vi.fn()}
        handleToggleAppliedFilter={vi.fn()}
        isServiceAnalyticsIntegration={false}
        resource_ids={[1, 2]}
      />
    );

    expect(getByPlaceholderText('Select a Region')).toBeVisible();
    expect(getByPlaceholderText('Select Nodebalancers')).toBeVisible();
    expect(getByPlaceholderText('e.g., 80,443,3000')).toBeVisible();
  });

  it('it should render successfully when the required props are passed for service type firewall', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'firewall',
          id: 4,
        })}
        emitFilterChange={vi.fn()}
        handleToggleAppliedFilter={vi.fn()}
        isServiceAnalyticsIntegration={false}
        resource_ids={[1, 2]}
      />
    );

    expect(getByPlaceholderText('Select Firewalls')).toBeVisible();
    expect(getByPlaceholderText('Select a Linode Region')).toBeVisible();
    expect(getByPlaceholderText('Select Interface Types')).toBeVisible();
    expect(getByPlaceholderText('e.g., 1234,5678')).toBeVisible();
  });

  it('it should render successfully when the required props are passed for service type objectstorage', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'objectstorage',
          id: 6,
        })}
        emitFilterChange={vi.fn()}
        handleToggleAppliedFilter={vi.fn()}
        isServiceAnalyticsIntegration={false}
        resource_ids={[1, 2]}
      />
    );

    expect(getByPlaceholderText('Select a Region')).toBeVisible();
    expect(getByPlaceholderText('Select Endpoints')).toBeVisible();
    expect(getByPlaceholderText('Select Buckets')).toBeVisible();
  });

  it('it should render successfully when the required props are passed for service type blockstorage', async () => {
    const { getByPlaceholderText } = renderWithTheme(
      <CloudPulseDashboardFilterBuilder
        dashboard={dashboardFactory.build({
          service_type: 'blockstorage',
          id: 7,
        })}
        emitFilterChange={vi.fn()}
        handleToggleAppliedFilter={vi.fn()}
        isServiceAnalyticsIntegration={false}
        resource_ids={[1, 2]}
      />
    );

    expect(getByPlaceholderText('Select a Region')).toBeVisible();
    expect(getByPlaceholderText('Select Volumes')).toBeVisible();
  });
});
