import { SvgIcon } from '@mui/material';
import * as React from 'react';

import { ChevronLeft } from '../../../assets/icons/index';
import { ChevronRight } from '../../../assets/icons/index';
import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
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

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const days = [];
  for (let i = 0; i < startDay; i++) {
    days.push(<Box key={`empty-${i}`} sx={{ height: 40, width: 40 }} />);
  }

  for (let day = 1; day <= endOfMonth.day; day++) {
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
        key={day}
        onClick={() => onDateClick(currentDay, focusedField)}
      >
        {day}
      </DayBox>
    );
  }
  const rightCalenderHeaderStyles = {
    display: 'flex',
    justifyContent: 'end',
  };

  return (
    <Box paddingBottom={2}>
      <Stack
        alignItems="center"
        direction="row"
        display="flex"
        gap={1 / 2}
        justifyContent="center"
        marginBottom={3}
        paddingTop={2}
        spacing={1}
      >
        {direction === 'left' && (
          <Button
            onClick={() => setMonth(month.minus({ months: 1 }))}
            sx={{ flexGrow: 1, justifyContent: 'flex-start', minWidth: '60px' }}
          >
            <SvgIcon component={ChevronLeft} viewBox="0 0 25 25" />
          </Button>
        )}
        {/* Display month and year as read-only text */}
        <Typography
          sx={{
            ...(direction === 'right' ? rightCalenderHeaderStyles : {}),
            flexGrow: 3,
            fontWeight: 'bold',
          }}
        >
          {months[month.month - 1]} {month.year}
        </Typography>

        {direction === 'right' && (
          <Button
            onClick={() => setMonth(month.plus({ months: 1 }))}
            sx={{ justifyContent: 'end' }}
          >
            <SvgIcon component={ChevronRight} viewBox="0 0 25 25" />
          </Button>
        )}
      </Stack>
      <Box display="grid" gridTemplateColumns="repeat(7, 40px)">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <Typography
            align="center"
            key={`weekday-${index}`}
            sx={{ fontWeight: '400' }}
          >
            {d}
          </Typography>
        ))}
        {days}
      </Box>
    </Box>
  );
};
