import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../../utilities/testHelpers';
import { DateRangePicker } from './DateRangePicker';

import type { DateRangePickerProps } from './DateRangePicker';

const START_DATE_LABEL = 'Start Date';
const END_DATE_LABEL = 'End Date';

const defaultProps: DateRangePickerProps = {
  endDateProps: {
    label: END_DATE_LABEL,
  },
  onApply: vi.fn() as DateRangePickerProps['onApply'],
  presetsProps: {
    enablePresets: true,
  },
  startDateProps: {
    label: START_DATE_LABEL,
  },
};

describe('DateRangePicker', () => {
  it('should render the DateRangePicker component with the correct label and placeholder', () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    // Check that the labels are visible
    expect(screen.getByText(START_DATE_LABEL)).toBeVisible();
    expect(screen.getByText(END_DATE_LABEL)).toBeVisible();

    // Check that the date input groups are visible (they don't have accessible names)
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2); // Start and End date groups

    // Check that the placeholder text is displayed in the spinbutton elements
    // Use getAllByRole since there are multiple Year/Month/Day spinbuttons
    const yearSpinbuttons = screen.getAllByRole('spinbutton', { name: 'Year' });
    const monthSpinbuttons = screen.getAllByRole('spinbutton', {
      name: 'Month',
    });
    const daySpinbuttons = screen.getAllByRole('spinbutton', { name: 'Day' });

    expect(yearSpinbuttons).toHaveLength(2); // One for start, one for end
    expect(monthSpinbuttons).toHaveLength(2);
    expect(daySpinbuttons).toHaveLength(2);

    // Check that all spinbuttons have the correct placeholder text
    yearSpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('YYYY');
    });
    monthSpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('MM');
    });
    daySpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('DD');
    });
  });

  it('should open the Popover when the TextField is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    // Try clicking on the group element (the textField wrapper)
    const groups = screen.getAllByRole('group');
    const startDateGroup = groups[0]; // First group is the start date
    await userEvent.click(startDateGroup);

    // Wait a bit for the popover to appear
    // Wait for the popover to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // The DateRangePicker should open a popover with calendar and buttons
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeVisible();

    // Should have Cancel and Apply buttons
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Apply' })).toBeVisible();
  });

  it('should call onCancel when the Cancel button is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    // Open the popover
    const groups = screen.getAllByRole('group');
    const startDateGroup = groups[0];
    await userEvent.click(startDateGroup);
    // Wait for the popover to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // Click the Cancel button
    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    // Verify the popover is closed
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should call onApply when the Apply button is clicked', async () => {
    // Mock current date for consistent results
    const mockDate = DateTime.fromISO('2025-02-04T14:11:14.933');

    // Mock the `DateTime.now()` function globally
    vi.spyOn(DateTime, 'now').mockReturnValue(mockDate as DateTime<true>);

    renderWithTheme(<DateRangePicker {...defaultProps} />);

    // Open the popover
    const groups = screen.getAllByRole('group');
    const startDateGroup = groups[0];
    await userEvent.click(startDateGroup);
    // Wait for the popover to appear
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeVisible();
    });

    // Click the Apply button
    const applyButton = screen.getByRole('button', { name: 'Apply' });
    await userEvent.click(applyButton);

    // Verify onApply was called with expected parameters
    expect(defaultProps.onApply).toHaveBeenCalledWith({
      endDate: null,
      selectedPreset: null,
      startDate: null,
    });

    vi.restoreAllMocks();
  });

  it('should display the error text when provided', () => {
    const props = {
      ...defaultProps,
      startDateProps: {
        ...defaultProps.startDateProps,
        errorMessage: 'Invalid date',
      },
    };
    renderWithTheme(<DateRangePicker {...props} />);
    expect(screen.getByRole('alert')).toBeVisible();
  });
});

describe('DateRangePicker - Date Display', () => {
  it('should display date values correctly when provided', async () => {
    // Mock current date for consistent results
    const mockDate = DateTime.fromISO('2025-02-04T14:11:14.933');
    vi.spyOn(DateTime, 'now').mockReturnValue(mockDate as DateTime<true>);

    const Props = {
      ...defaultProps,
      format: 'yyyy-MM-dd' as const, // Use a single format for testing
      startDateProps: {
        ...defaultProps.startDateProps,
        value: mockDate, // Set a test date
      },
      endDateProps: {
        ...defaultProps.endDateProps,
        value: mockDate.plus({ days: 1 }), // Set a test end date
      },
    };
    renderWithTheme(<DateRangePicker {...Props} />);

    // Check that the labels are visible
    expect(screen.getByText(START_DATE_LABEL)).toBeVisible();
    expect(screen.getByText(END_DATE_LABEL)).toBeVisible();

    // Check that the date input groups are visible
    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2); // Start and End date groups

    // Check that the date values are displayed correctly
    // Use getAllByRole since there are multiple Year/Month/Day spinbuttons
    const yearSpinbuttons = screen.getAllByRole('spinbutton', { name: 'Year' });
    const monthSpinbuttons = screen.getAllByRole('spinbutton', {
      name: 'Month',
    });
    const daySpinbuttons = screen.getAllByRole('spinbutton', { name: 'Day' });

    expect(yearSpinbuttons).toHaveLength(2);
    expect(monthSpinbuttons).toHaveLength(2);
    expect(daySpinbuttons).toHaveLength(2);

    // When values are provided, the spinbuttons show the actual date values
    // First spinbutton group is start date (2025-02-04), second is end date (2025-02-05)
    expect(yearSpinbuttons[0]).toHaveTextContent('2025'); // Start date year
    expect(yearSpinbuttons[1]).toHaveTextContent('2025'); // End date year
    expect(monthSpinbuttons[0]).toHaveTextContent('02'); // Start date month
    expect(monthSpinbuttons[1]).toHaveTextContent('02'); // End date month
    expect(daySpinbuttons[0]).toHaveTextContent('04'); // Start date day
    expect(daySpinbuttons[1]).toHaveTextContent('05'); // End date day

    vi.restoreAllMocks();
  });

  it('should render with correct structure and placeholders', async () => {
    renderWithTheme(
      <DateRangePicker {...defaultProps} format={'yyyy-MM-dd' as const} />,
    );

    // Check that the component renders correctly
    expect(screen.getByText(START_DATE_LABEL)).toBeVisible();
    expect(screen.getByText(END_DATE_LABEL)).toBeVisible();

    const groups = screen.getAllByRole('group');
    expect(groups).toHaveLength(2); // Start and End date groups

    // Check that the placeholder text is displayed correctly
    const yearSpinbuttons = screen.getAllByRole('spinbutton', { name: 'Year' });
    const monthSpinbuttons = screen.getAllByRole('spinbutton', {
      name: 'Month',
    });
    const daySpinbuttons = screen.getAllByRole('spinbutton', { name: 'Day' });

    expect(yearSpinbuttons).toHaveLength(2);
    expect(monthSpinbuttons).toHaveLength(2);
    expect(daySpinbuttons).toHaveLength(2);

    // Check that all spinbuttons have the correct placeholder text
    yearSpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('YYYY');
    });
    monthSpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('MM');
    });
    daySpinbuttons.forEach((spinbutton) => {
      expect(spinbutton).toHaveTextContent('DD');
    });
  });
});
