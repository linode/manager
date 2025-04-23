import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DateTimePicker } from './DateTimePicker';

import type { DateTimePickerProps } from './DateTimePicker';

const defaultProps: DateTimePickerProps = {
  label: 'Select Date and Time',
  onApply: vi.fn(),
  onCancel: vi.fn(),
  onChange: vi.fn(),
  placeholder: 'yyyy-MM-dd HH:mm',
  value: DateTime.fromISO('2024-10-25T15:30:00'),
};

describe('DateTimePicker Component', () => {
  it('should render the DateTimePicker component with the correct label and placeholder', () => {
    renderWithTheme(<DateTimePicker {...defaultProps} />);
    const textField = screen.getByRole('textbox', {
      name: 'Select Date and Time',
    });
    expect(textField).toBeVisible();
    expect(textField).toHaveAttribute('placeholder', 'yyyy-MM-dd HH:mm');
  });

  it('should open the Popover when the TextField is clicked', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} />);
    const textField = screen.getByRole('textbox', {
      name: 'Select Date and Time',
    });
    await userEvent.click(textField);
    expect(screen.getByRole('dialog')).toBeVisible(); // Verifying the Popover is open
  });

  it('should call onCancel when the Cancel button is clicked', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} />);
    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);
    expect(defaultProps.onCancel).toHaveBeenCalled();
  });

  it('should call onApply when the Apply button is clicked', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} />);
    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );
    const applyButton = screen.getByRole('button', { name: /Apply/i });
    await userEvent.click(applyButton);
    expect(defaultProps.onApply).toHaveBeenCalled();
    expect(defaultProps.onChange).toHaveBeenCalledWith(expect.any(DateTime)); // Ensuring onChange was called with a DateTime object
  });

  it('should handle date changes correctly', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} />);
    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );

    // Simulate selecting a date (e.g., 15th of the month)
    const dateButton = screen.getByRole('gridcell', { name: '15' });
    await userEvent.click(dateButton);

    // Check that the displayed value has been updated correctly (this assumes the date format)
    expect(defaultProps.onChange).toHaveBeenCalled();
  });

  it('should handle timezone changes correctly', async () => {
    const timezoneChangeMock = vi.fn(); // Create a mock function

    const updatedProps = {
      ...defaultProps,
      timeZoneSelectProps: { onChange: timezoneChangeMock, value: 'UTC' },
    };

    renderWithTheme(<DateTimePicker {...updatedProps} />);

    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );

    // Simulate selecting a timezone from the TimeZoneSelect
    const timezoneInput = screen.getByPlaceholderText(/Choose a Timezone/i);
    await userEvent.click(timezoneInput);

    // Select a timezone from the dropdown options
    await userEvent.click(
      screen.getByRole('option', { name: '(GMT -11:00) Niue Time' })
    );

    // Click the Apply button to trigger the change
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Verify that the onChange function was called with the expected value
    expect(timezoneChangeMock).toHaveBeenCalledWith('Pacific/Niue');
  });

  it('should display the error text when provided', () => {
    renderWithTheme(
      <DateTimePicker {...defaultProps} errorText="Invalid date-time" />
    );
    expect(screen.getByText(/Invalid date-time/i)).toBeVisible();
  });

  it('should format the date-time correctly when a custom format is provided', () => {
    renderWithTheme(
      <DateTimePicker
        {...defaultProps}
        format="dd/MM/yyyy HH:mm"
        value={DateTime.fromISO('2024-10-25T15:30:00')}
      />
    );
    const textField = screen.getByRole('textbox', {
      name: 'Select Date and Time',
    });

    expect(textField).toHaveValue('25/10/2024 15:30');
  });
  it('should not render the time selector when showTime is false', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} showTime={false} />);
    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );
    const timePicker = screen.queryByLabelText(/Select Time/i); // Label from timeSelectProps
    expect(timePicker).not.toBeInTheDocument();
  });

  it('should not render the timezone selector when showTimeZone is false', async () => {
    renderWithTheme(<DateTimePicker {...defaultProps} showTimeZone={false} />);
    await userEvent.click(
      screen.getByRole('textbox', { name: 'Select Date and Time' })
    );
    const timeZoneSelect = screen.queryByLabelText(/Timezone/i); // Label from timeZoneSelectProps
    expect(timeZoneSelect).not.toBeInTheDocument();
  });
});
