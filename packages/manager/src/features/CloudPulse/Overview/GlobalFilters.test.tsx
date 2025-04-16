import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalFilters } from './GlobalFilters';

const mockHandleAnyFilterChange = vi.fn();
const mockHandleDashboardChange = vi.fn();
const mockHandleTimeDurationChange = vi.fn();
const mockHandleToggleAppliedFilter = vi.fn();
const timeRangeSelectId = 'preset-select';
const setup = () => {
  return renderWithTheme(
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
    const { getByTestId } = setup();
    expect(getByTestId('global-refresh')).toBeInTheDocument();
  });

  it('Should show dashboard selectcomponent', () => {
    const { getByTestId } = setup();

    expect(getByTestId('cloudpulse-dashboard-select')).toBeInTheDocument();
  });

  it('Should have time range select with default value', () => {
    const screen = setup();

    const timeRangeSelect = screen.getByTestId(timeRangeSelectId);

    expect(timeRangeSelect).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', { name: 'Time Range' })
    ).toHaveAttribute('value', 'Last 30 Minutes');
  });
});
