import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DateTimeRangePicker } from './DateTimeRangePicker';

describe('DateTimeRangePicker Component', () => {
  const onChangeMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render start and end DateTimePickers with correct labels', () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    expect(screen.getByLabelText('Start Date and Time')).toBeVisible();
    expect(screen.getByLabelText('End Date and Time')).toBeVisible();
  });

  it('should call onChange when start date is changed', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Open start date picker
    await userEvent.click(screen.getByLabelText('Start Date and Time'));

    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Check if the onChange function is called with the expected DateTime value
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({ day: 10 }),
      null,
      null
    );
  });

  it('should show error when end date-time is before start date-time', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Open the end date picker
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);

    // Check if the date before the start date is disabled via a class or attribute
    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is not shown since the click was blocked
    expect(
      screen.getByText('End date/time cannot be before the start date/time.')
    ).toBeInTheDocument();
  });

  it('should show error when start date-time is after end date-time', async () => {
    renderWithTheme(
      <DateTimeRangePicker
        endLabel="End Date and Time"
        onChange={onChangeMock}
        startLabel="Start Date and Time"
      />
    );

    // Set the end date-time to the 15th
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set the start date-time to the 10th (which is earlier than the end date-time)
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '20' })); // Invalid date
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm the error message is displayed
    expect(
      screen.getByText('Start date/time cannot be after the end date/time.')
    ).toBeInTheDocument();
  });

  it('should display custom error messages when start date-time is after end date-time', async () => {
    renderWithTheme(
      <DateTimeRangePicker
        endDateErrorMessage="Custom end date error"
        endLabel="End Date and Time"
        onChange={onChangeMock}
        startDateErrorMessage="Custom start date error"
        startLabel="Start Date and Time"
      />
    );

    // Set the end date-time to the 15th
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set the start date-time to the 20th (which is earlier than the end date-time)
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '20' })); // Invalid date
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm the custom error message is displayed for the start date
    expect(screen.getByText('Custom start date error')).toBeInTheDocument();
  });

  it('should set the date range for the last 24 hours when the "Last 24 Hours" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 24 Hours" option
    const last24HoursOption = screen.getByText('Last 24 Hours');
    await userEvent.click(last24HoursOption);

    // Verify that onChange is called with the correct date range
    const now = DateTime.now();
    const expectedStartDateTime = now.minus({ hours: 24 });

    const expectedEndDateTime = now;

    const expectedStartDateValue = expectedStartDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );
    const expectedEndDateValue = expectedEndDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        day: expectedStartDateTime.day,
        month: expectedStartDateTime.month,
        year: expectedStartDateTime.year,
      }),
      expect.objectContaining({
        day: expectedEndDateTime.day,
        month: expectedEndDateTime.month,
        year: expectedEndDateTime.year,
      }),
      null
    );

    // Verify that Date input fields has the correct date range
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(expectedStartDateValue);
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(expectedEndDateValue);
  });

  it('should set the date range for the last 7 days when the "Last 7 Days" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 7 Days" option
    const last7DaysOption = screen.getByText('Last 7 Days');
    await userEvent.click(last7DaysOption);

    // Verify that onChange is called with the correct date range
    const now = DateTime.now();
    const expectedStartDateTime = now.minus({ days: 7 });
    const expectedEndDateTime = now;

    const expectedStartDateValue = expectedStartDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );
    const expectedEndDateValue = expectedEndDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );

    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        day: expectedStartDateTime.day,
        month: expectedStartDateTime.month,
        year: expectedStartDateTime.year,
      }),
      expect.objectContaining({
        day: expectedEndDateTime.day,
        month: expectedEndDateTime.month,
        year: expectedEndDateTime.year,
      }),
      null
    );

    // Verify that Date input fields have the correct date range
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(expectedStartDateValue);
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(expectedEndDateValue);
  });

  it('should set the date range for the last 30 days when the "Last 30 Days" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 30 Days" option
    const last30DaysOption = screen.getByText('Last 30 Days');
    await userEvent.click(last30DaysOption);

    const now = DateTime.now();
    const expectedStartDateTime = now.minus({ days: 30 });
    const expectedEndDateTime = now;

    // Use the same format as the component for verification
    const expectedStartDateValue = expectedStartDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );
    const expectedEndDateValue = expectedEndDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        day: expectedStartDateTime.day,
        month: expectedStartDateTime.month,
        year: expectedStartDateTime.year,
      }),
      expect.objectContaining({
        day: expectedEndDateTime.day,
        month: expectedEndDateTime.month,
        year: expectedEndDateTime.year,
      }),
      null
    );

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(expectedStartDateValue);
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(expectedEndDateValue);
  });

  it('should set the date range for this month when the "This Month" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "This Month" option
    const thisMonthOption = screen.getByText('This Month');
    await userEvent.click(thisMonthOption);

    const now = DateTime.now();
    const expectedStartDateTime = now.startOf('month');
    const expectedEndDateTime = now.endOf('month');

    // Use the same format as the component for verification
    const expectedStartDateValue = expectedStartDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );
    const expectedEndDateValue = expectedEndDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        day: expectedStartDateTime.day,
        month: expectedStartDateTime.month,
        year: expectedStartDateTime.year,
      }),
      expect.objectContaining({
        day: expectedEndDateTime.day,
        month: expectedEndDateTime.month,
        year: expectedEndDateTime.year,
      }),
      null
    );

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(expectedStartDateValue);
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(expectedEndDateValue);
  });

  it('should set the date range for last month when the "Last Month" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last Month" option
    const lastMonthOption = screen.getByText('Last Month');
    await userEvent.click(lastMonthOption);

    const now = DateTime.now();
    const lastMonth = now.minus({ months: 1 });
    const expectedStartDateTime = lastMonth.startOf('month');
    const expectedEndDateTime = lastMonth.endOf('month');

    // Use the same format as the component for verification
    const expectedStartDateValue = expectedStartDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );
    const expectedEndDateValue = expectedEndDateTime.toFormat(
      'yyyy-MM-dd HH:mm'
    );

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        day: expectedStartDateTime.day,
        month: expectedStartDateTime.month,
        year: expectedStartDateTime.year,
      }),
      expect.objectContaining({
        day: expectedEndDateTime.day,
        month: expectedEndDateTime.month,
        year: expectedEndDateTime.year,
      }),
      null
    );

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(expectedStartDateValue);
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(expectedEndDateValue);
  });

  it('should display the date range fields with empty values when the "Custom Range" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Custom Range" option
    const customRange = screen.getByText('Custom Range');
    await userEvent.click(customRange);

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue('');
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument();
  });
});
