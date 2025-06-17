import { screen } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalFilters } from './GlobalFilters';

const mockHandleAnyFilterChange = vi.fn();
const mockHandleDashboardChange = vi.fn();
const mockHandleTimeDurationChange = vi.fn();
const mockHandleToggleAppliedFilter = vi.fn();
const setup = () => {
  renderWithTheme(
    <GlobalFilters
      handleAnyFilterChange={mockHandleAnyFilterChange}
      handleDashboardChange={mockHandleDashboardChange}
      handleTimeDurationChange={mockHandleTimeDurationChange}
      handleToggleAppliedFilter={mockHandleToggleAppliedFilter}
    />
  );
};
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

    expect(
      screen.getByRole('combobox', { name: 'Time Range' })
    ).toHaveAttribute('value', 'Last 30 Minutes');
  });
});
