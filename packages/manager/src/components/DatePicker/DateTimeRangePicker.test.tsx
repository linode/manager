import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateTime } from 'luxon';
import * as React from 'react';

import { renderWithTheme } from 'src/utilities/testHelpers';

import { DateTimeRangePicker } from './DateTimeRangePicker';

import type { DateTimeRangePickerProps } from './DateTimeRangePicker';

const onChangeMock = vi.fn();

const Props: DateTimeRangePickerProps = {
  enablePresets: true,
  endDateProps: {
    label: 'End Date and Time',
  },
  onChange: onChangeMock,
  presetsProps: {
    label: 'Date Presets',
  },

  startDateProps: {
    label: 'Start Date and Time',
  },
};

describe('DateTimeRangePicker Component', () => {
  beforeEach(() => {
    // Mock DateTime.now to return a fixed datetime
    const fixedNow = DateTime.fromISO(
      '2024-12-18T00:28:27.071-06:00'
    ).toUTC() as DateTime<true>;
    vi.setSystemTime(fixedNow.toJSDate());
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
    vi.setSystemTime(vi.getRealSystemTime());

    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);
    const now = DateTime.now().set({ second: 0 });
    // Open start date picker
    await userEvent.click(screen.getByLabelText('Start Date and Time'));

    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    const expectedStartTime = now
      .set({
        day: 10,
        month: now.month,
        year: now.year,
      })
      .minus({ minutes: 30 })
      .toISO();

    // Check if the onChange function is called with the expected  value
    expect(onChangeMock).toHaveBeenCalledWith({
      end: now.toISO(),
      preset: 'custom_range',
      start: expectedStartTime,
      timeZone: null,
    });
  });

  it('should disable the end date-time which is before the selected start date-time', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Open the end date picker
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);

    expect(screen.getByRole('gridcell', { name: '10' })).toBeDisabled();
  });

  it('should show error when start date-time is after end date-time', async () => {
    const updateProps = {
      ...Props,
      enablePresets: false,
      presetsProps: { ...Props.presetsProps },
    };
    renderWithTheme(<DateTimeRangePicker {...updateProps} />);
    const now = DateTime.now().set({ second: 0 });
    // Set the end date-time to the 15th
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(
      screen.getByRole('gridcell', { name: now.day.toString() })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set the start date-time to the 10th (which is earlier than the end date-time)
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(
      screen.getByRole('gridcell', { name: (now.day + 1).toString() })
    ); // Invalid date
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm the error message is displayed
    expect(
      screen.getByText('Start date/time cannot be after the end date/time.')
    ).toBeInTheDocument();
  });

  it('should display custom error messages when start date-time is after end date-time', async () => {
    const updatedProps = {
      ...Props,
      enablePresets: false,
      endDateProps: {
        ...Props.endDateProps,
        errorMessage: 'Custom end date error',
        label: 'End Date and Time',
      },
      presetsProps: {},
      startDateProps: {
        ...Props.startDateProps,
        errorMessage: 'Custom start date error',
        label: 'Start Date and Time',
      },
    };
    renderWithTheme(<DateTimeRangePicker {...updatedProps} />);
    const now = DateTime.now().set({ second: 0 });
    // Set the end date-time to the 15th
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(
      screen.getByRole('gridcell', { name: now.day.toString() })
    );
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set the start date-time to the 20th (which is earlier than the end date-time)
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(
      screen.getByRole('gridcell', { name: (now.day + 1).toString() })
    ); // Invalid date
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm the custom error message is displayed for the start date
    expect(screen.getByText('Custom start date error')).toBeInTheDocument();
  });

  it('should set the date range for the last 24 hours when the "Last 24 Hours" preset is selected', async () => {
    renderWithTheme(<DateTimeRangePicker {...Props} />);
    const now = DateTime.now().set({ second: 0 });
    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 24 Hours" option
    const last24HoursOption = screen.getByText('Last 24 Hours');
    await userEvent.click(last24HoursOption);

    // Expected start and end dates in ISO format
    const expectedStartDateISO = now.minus({ hours: 24 }).toISO(); // 2024-12-17T00:28:27.071-06:00
    const expectedEndDateISO = now.toISO(); // 2024-12-18T00:28:27.071-06:00

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
    renderWithTheme(<DateTimeRangePicker {...Props} />);
    const now = DateTime.now().set({ second: 0 });
    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 7 Days" option
    const last7DaysOption = screen.getByText('Last 7 Days');
    await userEvent.click(last7DaysOption);

    // Expected start and end dates in ISO format
    const expectedStartDateISO = now.minus({ days: 7 }).toISO();
    const expectedEndDateISO = now.toISO();

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
    renderWithTheme(<DateTimeRangePicker {...Props} />);
    const now = DateTime.now().set({ second: 0 });
    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last 30 Days" option
    const last30DaysOption = screen.getByText('Last 30 Days');
    await userEvent.click(last30DaysOption);

    // Expected start and end dates in ISO format
    const expectedStartDateISO = now.minus({ days: 30 }).toISO();
    const expectedEndDateISO = now.toISO();

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
    renderWithTheme(<DateTimeRangePicker {...Props} />);
    const now = DateTime.now();
    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "This Month" option
    const thisMonthOption = screen.getByText('This Month');
    await userEvent.click(thisMonthOption);

    // Expected start and end dates in ISO format
    const expectedStartDateISO = now.startOf('month').toISO();
    const expectedEndDateISO = now.toISO();

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
    renderWithTheme(<DateTimeRangePicker {...Props} />);

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Last Month" option
    const lastMonthOption = screen.getByText('Last Month');
    await userEvent.click(lastMonthOption);

    const lastMonth = DateTime.now().set({ second: 0 }).minus({ months: 1 });

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

  it('should display the date range fields with 30 min difference values when the "Custom Range" preset is selected', async () => {
    const timezone = 'Asia/Kolkata';
    renderWithTheme(
      <DateTimeRangePicker
        {...Props}
        startDateProps={{ ...Props.startDateProps, timeZoneValue: timezone }}
      />
    );

    // Open the presets dropdown
    const presetsDropdown = screen.getByLabelText('Date Presets');
    await userEvent.click(presetsDropdown);

    // Select the "Custom Range" option
    const customRange = screen.getByText('Custom');
    await userEvent.click(customRange);
    const format = 'yyyy-MM-dd HH:mm';
    const now = DateTime.now().set({ second: 0 });
    const start = now.minus({ minutes: 30 });

    // Verify the input fields display the correct values
    expect(
      screen.getByRole('textbox', { name: 'Start Date and Time' })
    ).toHaveValue(`${start.toFormat(format)} (GMT+5:30)`);

    expect(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    ).toHaveValue(`${now.toFormat(format)} (GMT+5:30)`);
    const button = screen.getByRole('button', { name: 'Presets' });

    expect(button).toBeInTheDocument();

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date and Time');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Open the end date picker
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);

    // Set start date-time to the 12th
    await userEvent.click(screen.getByRole('gridcell', { name: '17' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set start date-time to the 20th
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '20' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Confirm error message is not displayed
    const errorText = screen.queryByText(
      'Start date/time cannot be after the end date/time.'
    );
    expect(errorText).toBeInTheDocument();
  });
});
