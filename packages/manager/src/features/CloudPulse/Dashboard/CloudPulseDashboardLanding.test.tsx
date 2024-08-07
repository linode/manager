import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardLanding } from './CloudPulseDashboardLanding';

const dashboardLabel = 'Dashboard 1';
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

queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
  data: {
    data: [
      {
        created: '2024-04-29T17:09:29',
        id: 1,
        label: dashboardLabel,
        service_type: 'linodes',
        type: 'standard',
        updated: null,
        widgets: {},
      },
    ],
  },
  error: false,
  isLoading: false,
});

describe('CloudPulseDashboardFilterBuilder component tests', () => {
  it('should render error placeholder if dashboard not selected', () => {
    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    expect(screen.getByPlaceholderText('Select a Dashboard')).toHaveAttribute(
      'value',
      ''
    );

    expect(
      screen.getByText('Select Dashboard and filters to visualize metrics.')
    ).toBeDefined();
  });

  it('should render error placeholder if some dashboard is selected and filter config is not present', () => {
    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(
      screen.getByRole('option', { name: dashboardLabel })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: dashboardLabel }));

    expect(
      screen.getByText(
        "No Filters Configured for selected dashboard's service type"
      )
    ).toBeDefined();
  });

  it('should render error placeholder if some dashboard is select and filters are not selected', () => {
    queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
      data: {
        data: [
          {
            created: '2024-04-29T17:09:29',
            id: 1,
            label: dashboardLabel,
            service_type: 'linode',
            type: 'standard',
            updated: null,
            widgets: {},
          },
        ],
      },
      error: false,
      isLoading: false,
    });

    const screen = renderWithTheme(<CloudPulseDashboardLanding />);

    expect(screen.getByPlaceholderText('Select a Dashboard')).toHaveAttribute(
      // check if dashboard is selected already
      'value',
      dashboardLabel
    );

    expect(
      screen.getByText('Select Dashboard and filters to visualize metrics.')
    ).toBeDefined();
  });
});
