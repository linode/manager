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

    expect(screen.getByLabelText('Start Date')).toBeVisible();
    expect(screen.getByLabelText('End Date and Time')).toBeVisible();
  });

  it('should call onChange when start date is changed', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Open start date picker
    await userEvent.click(screen.getByLabelText('Start Date'));

    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Check if the onChange function is called with the expected DateTime value
    expect(onChangeMock).toHaveBeenCalledWith(
      expect.objectContaining({ day: 10 }),
      null
    );
  });

  it.skip('should call onChange when end date is changed', async () => {
    renderWithTheme(
      <DateTimeRangePicker
        endLabel="End Date and Time"
        onChange={onChangeMock}
        startLabel="Start Date and Time"
      />
    );

    // Open the end date picker
    await userEvent.click(
      screen.getByRole('textbox', { name: 'End Date and Time' })
    );

    // Confirm the dialog is visible and wait for it
    expect(screen.getByRole('dialog')).toBeVisible();

    // Simulate selecting a date (e.g., 15th of the month)
    const element = screen.getByRole('gridcell', { name: '2' });

    await userEvent.click(element);
    // await userEvent.click(screen.getByRole('gridcell', { name: '1' }));

    // Click the 'Apply' button and wait for onChange to be called
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Verify onChange is called with the appropriate arguments
    expect(onChangeMock).toHaveBeenCalledWith(null, expect.any(DateTime));
  });

  it.skip('should show error when end date-time is before start date-time', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set end date-time to the 10th (before start date-time)
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getAllByText('Invalid dae and Time')).toHaveLength(2);
  });

  it.skip('should clear the error when a valid end date-time is selected', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Set start date-time to the 10th
    const startDateField = screen.getByLabelText('Start Date');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Set an invalid end date-time (e.g., 5th)
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '5' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.getAllByText('Invalid dae and Time')).toHaveLength(2);

    // Select a valid end date-time (e.g., 15th)
    await userEvent.click(endDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    expect(screen.queryByText('Invalid dae and Time')).not.toBeInTheDocument();
  });
});
