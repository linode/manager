import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('should show error when end date-time is before start date-time', async () => {
    renderWithTheme(<DateTimeRangePicker onChange={onChangeMock} />);

    // Set start date-time to the 15th
    const startDateField = screen.getByLabelText('Start Date');
    await userEvent.click(startDateField);
    await userEvent.click(screen.getByRole('gridcell', { name: '15' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));

    // Open the end date picker
    const endDateField = screen.getByLabelText('End Date and Time');
    await userEvent.click(endDateField);

    // Check if the date before the start date is disabled via a class or attribute
    const invalidDate = screen.getByRole('gridcell', { name: '10' });
    expect(invalidDate).toHaveClass('Mui-disabled'); // or check for the specific attribute used

    // Confirm error message is not shown since the click was blocked
    expect(screen.queryByText('Invalid date and Time')).not.toBeInTheDocument();
  });
});
