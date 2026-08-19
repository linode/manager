import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { dashboardFactory, serviceTypesFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardSelect } from './CloudPulseDashboardSelect';

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));
const mockDashboard = dashboardFactory.buildList(2);
const mockServiceTypesList = serviceTypesFactory.build({
  service_type: 'linode',
  label: 'Linodes',
});

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});

vi.mock('src/queries/cloudpulse/services', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');
  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});

describe('CloudPulseDashboardSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: { data: [mockServiceTypesList] },
      error: undefined,
      isLoading: false,
    });
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: mockDashboard,
      error: '',
      isLoading: false,
    });
  });

  it('reports ready state and renders an enabled picker', async () => {
    const onDashboardDiscoveryStateChange = vi.fn();

    renderWithTheme(
      <CloudPulseDashboardSelect
        onDashboardDiscoveryStateChange={onDashboardDiscoveryStateChange}
      />
    );

    await waitFor(() =>
      expect(onDashboardDiscoveryStateChange).toHaveBeenLastCalledWith({
        status: 'ready',
      })
    );
    expect(screen.getByTestId('dashboard-picker-trigger')).toBeEnabled();
  });

  it('reports loading state and disables the picker', async () => {
    const onDashboardDiscoveryStateChange = vi.fn();
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    });

    renderWithTheme(
      <CloudPulseDashboardSelect
        onDashboardDiscoveryStateChange={onDashboardDiscoveryStateChange}
      />
    );

    await waitFor(() =>
      expect(onDashboardDiscoveryStateChange).toHaveBeenLastCalledWith({
        status: 'loading',
      })
    );
    expect(screen.getByTestId('dashboard-picker-trigger')).toBeDisabled();
  });

  it('reports service types errors before dashboard errors', async () => {
    const onDashboardDiscoveryStateChange = vi.fn();
    queryMocks.useCloudPulseServiceTypes.mockReturnValue({
      data: undefined,
      error: new Error('Service types request failed'),
      isLoading: false,
    });
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [],
      error: 'linode,',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardSelect
        onDashboardDiscoveryStateChange={onDashboardDiscoveryStateChange}
      />
    );

    await waitFor(() =>
      expect(onDashboardDiscoveryStateChange).toHaveBeenLastCalledWith({
        errorText: 'Failed to fetch the services.',
        status: 'error',
      })
    );
  });

  it('reports a dashboard error when a partial result is available', async () => {
    const onDashboardDiscoveryStateChange = vi.fn();
    vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
      data: [mockDashboard[0]],
      error: 'linode,',
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardSelect
        onDashboardDiscoveryStateChange={onDashboardDiscoveryStateChange}
      />
    );

    await waitFor(() =>
      expect(onDashboardDiscoveryStateChange).toHaveBeenLastCalledWith({
        errorText: 'Failed to fetch the dashboards.',
        status: 'error',
      })
    );
    expect(screen.getByTestId('dashboard-picker-trigger')).toBeDisabled();
  });

  it('selects a dashboard option', () => {
    const handleDashboardChange = vi.fn();

    renderWithTheme(
      <CloudPulseDashboardSelect
        handleDashboardChange={handleDashboardChange}
      />
    );

    fireEvent.click(screen.getByTestId('dashboard-picker-trigger'));
    fireEvent.click(
      screen.getByRole('option', { name: mockDashboard[0].label })
    );

    expect(handleDashboardChange).toHaveBeenCalledWith(
      mockDashboard[0],
      undefined
    );
  });
});
