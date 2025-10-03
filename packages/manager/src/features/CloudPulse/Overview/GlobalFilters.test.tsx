import { screen } from '@testing-library/react';
import React from 'react';

import { databaseInstanceFactory } from 'src/factories';
import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalFilters } from './GlobalFilters';

const mockHandleAnyFilterChange = vi.fn();
const mockHandleDashboardChange = vi.fn();
const mockHandleTimeDurationChange = vi.fn();
const mockHandleToggleAppliedFilter = vi.fn();
const mockHandleGroupByChange = vi.fn();
const setup = () => {
  renderWithTheme(
    <GlobalFilters
      handleAnyFilterChange={mockHandleAnyFilterChange}
      handleDashboardChange={mockHandleDashboardChange}
      handleGroupByChange={mockHandleGroupByChange}
      handleTimeDurationChange={mockHandleTimeDurationChange}
      handleToggleAppliedFilter={mockHandleToggleAppliedFilter}
    />
  );
};

const queryMocks = vi.hoisted(() => ({
  useResourcesQuery: vi.fn().mockReturnValue({}),
}));

vi.mock('src/queries/cloudpulse/resources', async () => {
  const actual = await vi.importActual('src/queries/cloudpulse/resources');
  return {
    ...actual,
    useResourcesQuery: queryMocks.useResourcesQuery,
  };
});

describe('Global filters component test', () => {
  it('Should render refresh button', () => {
    setup();
    const globalRefreshButton = screen.getByTestId('global-refresh');
    expect(globalRefreshButton).toBeInTheDocument();
  });

  it('Should show dashboard selectcomponent', () => {
    setup();

    const dashboardSelect = screen.getByTestId('cloudpulse-dashboard-select');
    expect(dashboardSelect).toBeInTheDocument();
  });

  it('Should have time range select with default value', () => {
    setup();

    const timeRangeSelect = screen.getByText('Start Date');

    expect(timeRangeSelect).toBeInTheDocument();
  });

  it('Should show circle progress if resources call is loading', async () => {
    queryMocks.useResourcesQuery.mockReturnValue({
      data: [{ ...databaseInstanceFactory.build(), clusterSize: 1 }],
      isLoading: true,
    });

    setup();

    const progress = await screen.findByTestId('circle-progress');
    expect(progress).toBeInTheDocument();
  });
});
