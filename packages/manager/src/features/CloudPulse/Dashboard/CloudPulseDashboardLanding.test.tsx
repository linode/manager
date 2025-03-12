import { fireEvent } from '@testing-library/react';
import React from 'react';

import { dashboardFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardLanding } from './CloudPulseDashboardLanding';

const dashboardLabel = 'Factory Dashboard-1';
const selectDashboardLabel = 'Select a Dashboard';
const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useLoadUserPreferences: vi.fn().mockReturnValue({}),
}));

vi.mock('../Utils/UserPreference', async () => {
  const actual = await vi.importActual('../Utils/UserPreference');
  return {
    ...actual,
    useLoadUserPreferences: queryMocks.useLoadUserPreferences,
  };
});

queryMocks.useLoadUserPreferences.mockReturnValue({ isLoading: false });

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});
const mockDashboard = dashboardFactory.build();

queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
  data: {
    data: mockDashboard,
  },
  error: false,
  isLoading: false,
});

vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
  data: [mockDashboard],
  error: '',
  isLoading: false,
});
describe('CloudPulseDashboardFilterBuilder component tests', () => {
  it('should render error placeholder if dashboard not selected', () => {
    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    expect(screen.getByText('metrics')).toBeInTheDocument();

    expect(screen.getByPlaceholderText(selectDashboardLabel)).toHaveAttribute(
      'value',
      ''
    );

    expect(
      screen.getByText('Select a dashboard and filters to visualize metrics.')
    ).toBeDefined();
  });

  it('should render error placeholder if some dashboard is selected and filter config is not present', () => {
    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    fireEvent.change(screen.getByPlaceholderText(selectDashboardLabel), {
      target: { value: 'a' },
    });

    expect(
      screen.getByRole('option', { name: dashboardLabel })
    ).toBeInTheDocument();
  });

  it('should render error placeholder if some dashboard is select and filters are not selected', () => {
    queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
      data: {
        data: dashboardFactory.buildList(1, {
          label: dashboardLabel,
          service_type: 'linode',
        }),
      },
      error: false,
      isLoading: false,
    });

    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    fireEvent.change(screen.getByPlaceholderText(selectDashboardLabel), {
      target: { value: 'a' },
    });

    expect(
      screen.getByRole('option', { name: dashboardLabel })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: dashboardLabel }));

    expect(screen.getByPlaceholderText(selectDashboardLabel)).toHaveAttribute(
      // check if dashboard is selected already
      'value',
      dashboardLabel
    );

    expect(
      screen.getByText('Select a dashboard and filters to visualize metrics.')
    ).toBeDefined();
  });
});
