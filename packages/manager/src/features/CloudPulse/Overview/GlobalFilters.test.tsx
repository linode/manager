import { fireEvent } from '@testing-library/react';
import React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { GlobalFilters } from './GlobalFilters';

const mockHandleAnyFilterChange = vi.fn();
const mockHandleDashboardChange = vi.fn();
const mockHandleTimeDurationChange = vi.fn();
const timeRangeSelectId = 'cloudpulse-time-duration';
const setup = () => {
  return renderWithTheme(
    <GlobalFilters
      handleAnyFilterChange={mockHandleAnyFilterChange}
      handleDashboardChange={mockHandleDashboardChange}
      handleTimeDurationChange={mockHandleTimeDurationChange}
    />
  );
};
describe('Global filters component test', () => {
  it('Should render refresh button', () => {
    const { getByTestId } = setup();
    expect(getByTestId('global-refresh')).toBeInTheDocument();
  }),
    it('Should show dashboard selectcomponent', () => {
      const { getByTestId } = setup();

      expect(getByTestId('cloudpulse-dashboard-select')).toBeInTheDocument();
    }),
    it('Should have time range select with default value', () => {
      const screen = setup();

      const timeRangeSelect = screen.getByTestId(timeRangeSelectId);

      expect(timeRangeSelect).toBeInTheDocument();

      expect(
        screen.getByRole('combobox', { name: 'Select Time Duration' })
      ).toHaveAttribute('value', 'Last 30 Minutes');
    });
});
