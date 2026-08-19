import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalFilters } from './GlobalFilters';

import type { DashboardDiscoveryState } from '../shared/CloudPulseDashboardSelect';

type DashboardSelectProps = {
  onDashboardDiscoveryStateChange?: (state: DashboardDiscoveryState) => void;
};

const dashboardDiscoveryMocks = vi.hoisted(() => ({
  state: { status: 'ready' } as DashboardDiscoveryState,
}));

vi.mock('../shared/CloudPulseDashboardSelect', () => ({
  CloudPulseDashboardSelect: ({
    onDashboardDiscoveryStateChange,
  }: DashboardSelectProps) => {
    React.useEffect(() => {
      onDashboardDiscoveryStateChange?.(dashboardDiscoveryMocks.state);
    }, [onDashboardDiscoveryStateChange]);

    return <div data-testid="cloudpulse-dashboard-select" />;
  },
}));

const mockHandleAnyFilterChange = vi.fn();
const mockHandleDashboardChange = vi.fn();
const mockHandleTimeDurationChange = vi.fn();
const mockHandleToggleAppliedFilter = vi.fn();
const mockHandleGroupByChange = vi.fn();
const handleDownloadPDF = vi.fn();
const setup = () => {
  renderWithTheme(
    <GlobalFilters
      handleAnyFilterChange={mockHandleAnyFilterChange}
      handleDashboardChange={mockHandleDashboardChange}
      handleDownloadPDF={handleDownloadPDF}
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
  beforeEach(() => {
    dashboardDiscoveryMocks.state = { status: 'ready' };
  });

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

    const timeRangeSelect = screen.getByTestId('preset-button');

    expect(timeRangeSelect).toBeInTheDocument();
  });

  it('shows discovery loading through the filter builder', async () => {
    dashboardDiscoveryMocks.state = { status: 'loading' };
    setup();

    expect(await screen.findByTestId('circle-progress')).toBeVisible();
  });

  it('shows discovery errors through the filter builder', async () => {
    dashboardDiscoveryMocks.state = {
      errorText: 'Failed to fetch the dashboards.',
      status: 'error',
    };
    setup();

    expect(
      await screen.findByText('Failed to fetch the dashboards.')
    ).toBeVisible();
  });
});
