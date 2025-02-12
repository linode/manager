import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../../utilities/testHelpers';
import { DateRangePicker } from './DateRangePicker';

import type { DateRangePickerProps } from './DateRangePicker';

const defaultProps: DateRangePickerProps = {
  endDateProps: {
    label: 'End Date',
    placeholder: 'YYYY-MM-DD',
  },
  onApply: vi.fn() as DateRangePickerProps['onApply'],
  presetsProps: {
    enablePresets: true,
  },
  startDateProps: {
    label: 'Start Date',
    placeholder: 'YYYY-MM-DD',
  },
};

describe('DateRangePicker', () => {
  it('should render the DateRangePicker component with the correct label and placeholder', () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);

    expect(
      screen.getByRole('textbox', {
        name: 'Start Date',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', {
        name: 'End Date',
      })
    ).toBeVisible();
    expect(
      screen.getByRole('textbox', {
        name: 'Start Date',
      })
    ).toHaveAttribute('placeholder', 'YYYY-MM-DD');
    expect(
      screen.getByRole('textbox', {
        name: 'End Date',
      })
    ).toHaveAttribute('placeholder', 'YYYY-MM-DD');
  });

  it('should open the Popover when the TextField is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);
    const textField = screen.getByRole('textbox', {
      name: 'Start Date',
    });
    await userEvent.click(textField);
    expect(screen.getByRole('dialog')).toBeVisible(); // Verifying the Popover is open
  });

  it('should call onCancel when the Cancel button is clicked', async () => {
    renderWithTheme(<DateRangePicker {...defaultProps} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Start Date' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull(); // Verifying the Popover is closed
  });

  it('should call onApply when the Apply button is clicked', async () => {
    // Mock current date for consistent results
    const mockDate = DateTime.fromISO('2025-02-04T14:11:14.933-06:00');

    // Mock the `DateTime.now()` function globally
    vi.spyOn(DateTime, 'now').mockReturnValue(mockDate as DateTime<true>);

    renderWithTheme(<DateRangePicker {...defaultProps} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Start Date' }));
    await userEvent.click(screen.getByRole('button', { name: 'Last day' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    // Normalize values before assertion
    const expectedStartDate = mockDate.minus({ days: 1 }).toISO();
    const expectedEndDate = mockDate.toISO();

    expect(defaultProps.onApply).toHaveBeenCalledWith({
      endDate: expectedEndDate,
      selectedPreset: 'Last day',
      startDate: expectedStartDate,
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
