import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DateTimeRangePicker } from './DateTimeRangePicker';

describe('DateTimeRangePicker Component', () => {
  const onChangeMock = vi.fn();

  let fixedNow: DateTime;

  beforeEach(() => {
    // Mock DateTime.now to return a fixed datetime
    fixedNow = DateTime.fromISO(
      '2024-12-18T00:28:27.071-06:00'
    ) as DateTime<true>;
    vi.spyOn(DateTime, 'now').mockImplementation(() => fixedNow);
  });

  afterEach(() => {
    // Restore the original DateTime.now implementation after each test
    vi.restoreAllMocks();
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

    // Check if the onChange function is called with the expected  value
    expect(onChangeMock).toHaveBeenCalledWith({
      end: null,
      preset: 'custom_range',
      start: '2024-12-10T00:00:00.000-06:00',
      timeZone: null,
    });
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

    // Set start date-time to the 10th
    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is displayed
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

    // Expected start and end dates in ISO format
    const expectedStartDateISO = fixedNow.minus({ hours: 24 }).toISO(); // 2024-12-17T00:28:27.071-06:00
    const expectedEndDateISO = fixedNow.toISO(); // 2024-12-18T00:28:27.071-06:00

    // Verify onChangeMock was called with correct ISO strings
    expect(onChangeMock).toHaveBeenCalledWith({
      end: expectedEndDateISO,
      preset: '24hours',
      start: expectedStartDateISO,
      timeZone: null,
    });
    expect(
      screen.queryByRole('button', { name: 'Presets' })
    ).not.toBeInTheDocument();
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

    // Expected start and end dates in ISO format
    const expectedStartDateISO = fixedNow.minus({ days: 7 }).toISO();
    const expectedEndDateISO = fixedNow.toISO();

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith({
      end: expectedEndDateISO,
      preset: '7days',
      start: expectedStartDateISO,
      timeZone: null,
    });
    expect(
      screen.queryByRole('button', { name: 'Presets' })
    ).not.toBeInTheDocument();
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

    // Expected start and end dates in ISO format
    const expectedStartDateISO = fixedNow.minus({ days: 30 }).toISO();
    const expectedEndDateISO = fixedNow.toISO();

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith({
      end: expectedEndDateISO,
      preset: '30days',
      start: expectedStartDateISO,
      timeZone: null,
    });
    expect(
      screen.queryByRole('button', { name: 'Presets' })
    ).not.toBeInTheDocument();
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

    // Expected start and end dates in ISO format
    const expectedStartDateISO = fixedNow.startOf('month').toISO();
    const expectedEndDateISO = fixedNow.endOf('month').toISO();

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith({
      end: expectedEndDateISO,
      preset: 'this_month',
      start: expectedStartDateISO,
      timeZone: null,
    });
    expect(
      screen.queryByRole('button', { name: 'Presets' })
    ).not.toBeInTheDocument();
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

    const lastMonth = fixedNow.minus({ months: 1 });

    // Expected start and end dates in ISO format
    const expectedStartDateISO = lastMonth.startOf('month').toISO();
    const expectedEndDateISO = lastMonth.endOf('month').toISO();

    // Verify that onChange is called with the correct date range
    expect(onChangeMock).toHaveBeenCalledWith({
      end: expectedEndDateISO,
      preset: 'last_month',
      start: expectedStartDateISO,
      timeZone: null,
    });
    expect(
      screen.queryByRole('button', { name: 'Presets' })
    ).not.toBeInTheDocument();
  });

  it('should display the date range fields with empty values when the "Custom Range" preset is selected', async () => {
    renderWithTheme(
      <DateTimeRangePicker enablePresets={true} onChange={onChangeMock} />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Custom Range" option
    const customRange = screen.getByText('Custom');
    await userEvent.click(customRange);

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue('');
    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Presets' })).toBeInTheDocument();

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Open the end date picker
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);

    // Set start date-time to the 12th
    await userEvent.click(screen.getByRole('gridcell', { name: '12' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is  shown since the click was blocked
    expect(
      screen.getByText('End date/time cannot be before the start date/time.')
    ).toBeInTheDocument();

    // Set start date-time to the 11th
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '11' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is not displayed
    expect(
      screen.queryByText('End date/time cannot be before the start date/time.')
    ).not.toBeInTheDocument();

    // Set start date-time to the 20th
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '20' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is not displayed
    expect(
      screen.queryByText('Start date/time cannot be after the end date/time.')
    ).toBeInTheDocument();
  });
});
