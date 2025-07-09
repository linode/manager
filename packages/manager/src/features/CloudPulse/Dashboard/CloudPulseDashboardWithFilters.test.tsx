import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { dashboardFactory, serviceTypesFactory } from 'src/factories';
import * as utils from 'src/features/CloudPulse/Utils/utils';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { CloudPulseDashboardWithFilters } from './CloudPulseDashboardWithFilters';

const queryMocks = vi.hoisted(() => ({
  useCloudPulseDashboardByIdQuery: vi.fn().mockReturnValue({}),
  useCloudPulseDashboardsQuery: vi.fn().mockReturnValue({}),
  useCloudPulseServiceTypes: vi.fn().mockReturnValue({}),
}));

const circleProgress = 'circle-progress';
const mandatoryFiltersError = 'Select filters to visualize metrics.';

vi.mock('src/queries/cloudpulse/dashboards', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/dashboards');
  return {
    ...actual,
    useCloudPulseDashboardByIdQuery: queryMocks.useCloudPulseDashboardByIdQuery,
    useCloudPulseDashboardsQuery: queryMocks.useCloudPulseDashboardsQuery,
  };
});

vi.mock('src/queries/cloudpulse/services.ts', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/services');

  return {
    ...actual,
    useCloudPulseServiceTypes: queryMocks.useCloudPulseServiceTypes,
  };
});
const mockDashboard = dashboardFactory.build();
const mockServiceTypesList = serviceTypesFactory.build();
queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
  data: {
    data: mockDashboard,
  },
  error: false,
  isLoading: false,
});

queryMocks.useCloudPulseDashboardsQuery.mockReturnValue({
  data: {
    data: [mockDashboard],
  },
  error: false,
  isLoading: false,
});

queryMocks.useCloudPulseServiceTypes.mockReturnValue({
  data: {
    data: [mockServiceTypesList],
  },
  error: false,
  isLoading: false,
});

vi.spyOn(utils, 'getAllDashboards').mockReturnValue({
  data: [mockDashboard],
  error: '',
  isLoading: false,
});

describe('CloudPulseDashboardWithFilters component tests', () => {
  it('renders a CloudPulseDashboardWithFilters component with error placeholder', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: {
        data: mockDashboard,
      },
      error: false,
      isError: true,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters dashboardId={1} resource={1} />
    );

    const error = screen.getByText('Error while loading Dashboard with Id - 1');
    expect(error).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component successfully without error placeholders', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: mockDashboard,
      error: false,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters dashboardId={1} resource={1} />
    );

    const circle = screen.getByTestId(circleProgress);
    expect(circle).toBeDefined(); // the dashboards started to render
  });

  it('renders a CloudPulseDashboardWithFilters component successfully for dbaas', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: { ...mockDashboard, service_type: 'dbaas' },
      error: false,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters dashboardId={1} resource={1} />
    );
    const circle = screen.getByTestId(circleProgress);
    const startDate = screen.getByText('Start Date');
    const nodeTypeSelect = screen.getByTestId('node-type-select');
    expect(circle).toBeDefined(); // the dashboards started to render
    expect(startDate).toBeInTheDocument();
    expect(nodeTypeSelect).toBeInTheDocument();
  });

  it('renders a CloudPulseDashboardWithFilters component with mandatory filter error for dbaas', async () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: { ...mockDashboard, service_type: 'dbaas' },
      error: false,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters dashboardId={1} resource={1} />
    );
    const closeIcon = screen.getByTestId('CloseIcon');
    expect(closeIcon).toBeDefined();

    await userEvent.click(screen.getByTitle('Clear')); // clear the value

    const error = screen.getByText(mandatoryFiltersError);
    expect(error).toBeDefined();
  });

  it('renders a CloudPulseDashboardWithFilters component with no filters configured error', () => {
    queryMocks.useCloudPulseDashboardByIdQuery.mockReturnValue({
      data: { ...mockDashboard, service_type: 'xyz' },
      error: false,
      isError: false,
      isLoading: false,
    });

    renderWithTheme(
      <CloudPulseDashboardWithFilters dashboardId={1} resource={1} />
    );

    const noFilterText = screen.getByText(
      'No Filters Configured for Service Type - xyz'
    );
    expect(noFilterText).toBeDefined();
  });
});
