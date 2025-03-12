import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithTheme } from '../../../utilities/testHelpers';
import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { DateTimeRangePickerProps } from './DateTimeRangePicker';

// Mock current date for consistency
const mockDate = DateTime.fromISO('2025-02-04T12:00:00.000Z').setZone('UTC');

const defaultProps: DateTimeRangePickerProps = {
  endDateProps: {
    label: 'End Date',
  },
  onApply: vi.fn() as DateTimeRangePickerProps['onApply'],
  presetsProps: {
    enablePresets: true,
  },
  startDateProps: {
    label: 'Start Date',
    value: mockDate,
  },
};

describe('DateTimeRangePicker', () => {
  it('should render the DateTimeRangePicker component with the correct label and placeholder', () => {
    renderWithTheme(<DateTimeRangePicker {...defaultProps} />);

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
    ).toHaveAttribute('placeholder', 'YYYY-MM-DD hh:mm aa');
    expect(
      screen.getByRole('textbox', {
        name: 'End Date',
      })
    ).toHaveAttribute('placeholder', 'YYYY-MM-DD hh:mm aa');
  });

  it('should open the Popover when the Start Date field is clicked', async () => {
    renderWithTheme(<DateTimeRangePicker {...defaultProps} />);
    const textField = screen.getByRole('textbox', { name: 'Start Date' });
    await userEvent.click(textField);
    expect(screen.getByRole('dialog')).toBeVisible(); // Popover should be open
  });

  it('should call onCancel when the Cancel button is clicked', async () => {
    renderWithTheme(<DateTimeRangePicker {...defaultProps} />);
    await userEvent.click(screen.getByRole('textbox', { name: 'Start Date' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('dialog')).toBeNull(); // Popover should be closed
  });

  it('should display error text when provided', () => {
    const props = {
      ...defaultProps,
      startDateProps: {
        ...defaultProps.startDateProps,
        errorMessage: 'Invalid date',
      },
    };
    renderWithTheme(<DateTimeRangePicker {...props} />);
    expect(screen.getByRole('alert')).toBeVisible();
  });

  describe('DateTimeRangePicker - Format Validation', () => {
    const formats: ReadonlyArray<
      NonNullable<DateTimeRangePickerProps['format']>
    > = [
      'MM/dd/yyyy HH:mm',
      'MM/dd/yyyy hh:mm a',
      'dd-MM-yyyy HH:mm',
      'dd-MM-yyyy hh:mm a',
      'yyyy-MM-dd HH:mm',
      'yyyy-MM-dd hh:mm a',
    ];

    const expectedPlaceholderValues = {
      'MM/dd/yyyy HH:mm': 'MM/DD/YYYY hh:mm',
      'MM/dd/yyyy hh:mm a': 'MM/DD/YYYY hh:mm aa',
      'dd-MM-yyyy HH:mm': 'DD-MM-YYYY hh:mm',
      'dd-MM-yyyy hh:mm a': 'DD-MM-YYYY hh:mm aa',
      'yyyy-MM-dd HH:mm': 'YYYY-MM-DD hh:mm',
      'yyyy-MM-dd hh:mm a': 'YYYY-MM-DD hh:mm aa',
    };

    formats.forEach((format) => {
      it(`should accept and display dates correctly in ${format} format`, async () => {
        renderWithTheme(
          <DateTimeRangePicker {...defaultProps} format={format} />
        );

        expect(
          screen.getByRole('textbox', { name: 'Start Date' })
        ).toHaveAttribute('placeholder', expectedPlaceholderValues[format]);
        expect(
          screen.getByRole('textbox', { name: 'End Date' })
        ).toHaveAttribute('placeholder', expectedPlaceholderValues[format]);
      });
    });

    it('should prevent invalid date input for each format', async () => {
      renderWithTheme(
        <DateTimeRangePicker {...defaultProps} format="yyyy-MM-dd hh:mm a" />
      );

      const startDateField = screen.getByRole('textbox', {
        name: 'Start Date',
      });

      await userEvent.type(startDateField, 'invalid-date');

      expect(startDateField).not.toHaveValue('invalid-date');
    });
  });

  describe('Time and Timezone Selection', () => {
    it('should allow selecting start and end times', async () => {
      renderWithTheme(<DateTimeRangePicker {...defaultProps} />);

      await userEvent.click(
        screen.getByRole('textbox', { name: 'Start Date' })
      );

      const startTimeField = screen.getByLabelText(/Start Time/i);
      const endTimeField = screen.getByLabelText(/End Time/i);

      await userEvent.type(startTimeField, '2:00 AM');
      await userEvent.type(endTimeField, '4:00 PM');

      expect(startTimeField).toHaveValue('02:00 AM');
      expect(endTimeField).toHaveValue('04:00 PM');
    });

    it('should update time correctly when selecting a new timezone', async () => {
      renderWithTheme(<DateTimeRangePicker {...defaultProps} />);

      const startDateField = screen.getByRole('textbox', {
        name: 'Start Date',
      });
      expect(startDateField).toHaveValue('2025-02-04 12:00 PM');

      await userEvent.click(startDateField);
      expect(screen.getByRole('dialog')).toBeVisible();

      const startTimeField = screen.getByLabelText(/Start Time/i);

      await userEvent.type(startTimeField, '12:00 AM');
      expect(startTimeField).toHaveValue('12:00 AM');

      const inputElement = screen.getByRole('combobox', { name: 'Timezone' });
      fireEvent.focus(inputElement);
      fireEvent.keyDown(inputElement, { key: 'ArrowDown' });
      const optionElement = screen.getByRole('option', {
        name: '(GMT -10:00) Hawaii-Aleutian Standard Time',
      });

      await userEvent.click(optionElement);

      // Ensure the local time remains the same, but the timezone changes
      expect(startTimeField).toHaveValue('12:00 AM');
    });
  });
});
