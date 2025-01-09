import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DatePicker } from './DatePicker';

import type { DatePickerProps } from './DatePicker';

const props: DatePickerProps = {
  onChange: vi.fn(),
  placeholder: 'Pick a date',
  textFieldProps: { errorText: 'Invalid date', label: 'Select a date' },
  value: null,
};

describe('DatePicker', () => {
  it('should render the DatePicker component', () => {
    renderWithTheme(<DatePicker {...props} />);
    const DatePickerField = screen.getByRole('textbox', {
      name: 'Select a date',
    });

    expect(DatePickerField).toBeVisible();
  });

  it('should handle value changes', async () => {
    renderWithTheme(<DatePicker {...props} />);

    const calendarButton = screen.getByRole('button', { name: 'Choose date' });

    // Click the calendar button to open the date picker
    await userEvent.click(calendarButton);

    // Find a date button to click (e.g., the 15th of the month)
    const dateToSelect = screen.getByRole('gridcell', { name: '15' });
    await userEvent.click(dateToSelect);

    // Check if onChange was called after selecting a date
    expect(props.onChange).toHaveBeenCalled();
  });

  it('should display the error text when provided', () => {
    renderWithTheme(<DatePicker {...props} />);
    const errorMessage = screen.getByText('Invalid date');
    expect(errorMessage).toBeVisible();
  });

  it('should display the helper text when provided', () => {
    renderWithTheme(<DatePicker {...props} helperText="Choose a valid date" />);
    const helperText = screen.getByText('Choose a valid date');
    expect(helperText).toBeVisible();
  });

  it('should use the default format when no format is specified', () => {
    renderWithTheme(
      <DatePicker {...props} value={DateTime.fromISO('2024-10-25')} />
    );
    const datePickerField = screen.getByRole('textbox', {
      name: 'Select a date',
    });
    expect(datePickerField).toHaveValue('2024-10-25');
  });

  it('should handle the custom format correctly', () => {
    renderWithTheme(
      <DatePicker
        {...props}
        format="dd/MM/yyyy"
        value={DateTime.fromISO('2024-10-25')}
      />
    );
    const datePickerField = screen.getByRole('textbox', {
      name: 'Select a date',
    });
    expect(datePickerField).toHaveValue('25/10/2024');
  });
});
