import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import * as React from 'react';

import { Box } from '../../Box/Box';
import { IconButton } from '../../IconButton';
import { Stack } from '../../Stack/Stack';
import { Typography } from '../../Typography/Typography';
import { DayBox } from './Calendar.styles';

import type { DateTime } from 'luxon';

interface CalendarProps {
  direction: 'left' | 'right';
  endDate: DateTime | null;
  focusedField: 'end' | 'start';
  month: DateTime;
  onDateClick: (date: DateTime, field: 'end' | 'start') => void;
  setMonth: (date: DateTime) => void;
  startDate: DateTime | null;
}

export const Calendar = ({
  direction,
  endDate,
  focusedField,
  month,
  onDateClick,
  setMonth,
  startDate,
}: CalendarProps) => {
  const startOfMonth = month.startOf('month');
  const endOfMonth = month.endOf('month');
  const startDay = startOfMonth.weekday % 7;
  const totalDaysInMonth = endOfMonth.day;
  const totalGridCells = 42; // Always 6 rows (6 × 7)
  const days = [];

  // Fill leading empty slots before the first day of the month
  for (let i = 0; i < startDay; i++) {
    days.push(<Box key={`empty-${i}`} sx={{ height: 40, width: 40 }} />);
  }

  // Fill actual days of the month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const currentDay = month.set({ day });
    const isSelected =
      startDate &&
      endDate &&
      startDate.isValid &&
      endDate.isValid &&
      currentDay >= startDate &&
      currentDay <= endDate;
    const isStartOrEnd =
      (startDate && startDate.isValid && currentDay.equals(startDate)) ||
      (endDate && endDate.isValid && currentDay.equals(endDate));

    days.push(
      <DayBox
        isSelected={isSelected}
        isStartOrEnd={isStartOrEnd}
        key={`${month.month} ${day}`}
        onClick={() => onDateClick(currentDay, focusedField)}
      >
        {day}
      </DayBox>
    );
  }

  // Fill trailing empty slots after the last day of the month
  const remainingCells = totalGridCells - days.length;
  for (let i = 0; i < remainingCells; i++) {
    days.push(<Box key={`empty-after-${i}`} sx={{ height: 40, width: 40 }} />);
  }

  return (
    <Box paddingBottom={2}>
      {/* Header (Month & Year) */}
      <Stack
        alignItems="center"
        direction="row"
        display="flex"
        gap={1 / 2}
        justifyContent="space-between"
        marginBottom={3}
        paddingTop={2}
        spacing={1}
        textAlign={direction}
      >
        {direction === 'left' && (
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              disableRipple
              onClick={() => setMonth(month.minus({ months: 1 }))}
              size="medium"
            >
              <ChevronLeftIcon />
            </IconButton>
          </Box>
        )}
        {/* Display Month & Year */}

        <Typography sx={{ flexGrow: 3 }}>
          {month.toFormat('MMMM yyyy')}
        </Typography>

        {direction === 'right' && (
          <Box sx={{ flexGrow: 1 }}>
            <IconButton
              disableRipple
              onClick={() => setMonth(month.plus({ months: 1 }))}
              size="medium"
            >
              <ChevronRightIcon />
            </IconButton>
          </Box>
        )}
      </Stack>

      {/* Calendar Grid */}
      <Box display="grid" gridTemplateColumns="repeat(7, 40px)">
        {/* Weekday Labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <Typography align="center" key={`weekday-${index}`}>
            {d}
          </Typography>
        ))}
        {days}
      </Box>
    </Box>
  );
};
