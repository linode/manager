import { SvgIcon } from '@mui/material';
import * as React from 'react';

import { chevronLeft } from '../../../assets/icons/index';
import { chevronRight } from '../../../assets/icons/index';
import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
import { Stack } from '../../Stack/Stack';
import { Typography } from '../../Typography/Typography';

import type { Theme } from '@mui/material/styles';
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
      <Box
        sx={(theme: Theme) => ({
          '&:hover': {
            bgcolor: !isStartOrEnd ? theme.bg.app : theme.palette.primary.main,
            border: `1px solid ${theme.borderColors.divider}`,
            borderRadius: '50%',
            color: !isStartOrEnd ? theme.color.black : theme.color.white,
          },
          alignItems: 'center',
          bgcolor: isStartOrEnd
            ? theme.palette.primary.main
            : isSelected
            ? theme.palette.primary.light
            : 'transparent',
          borderRadius: '50%',
          color:
            isStartOrEnd || isSelected ? 'white' : theme.palette.text.primary,
          cursor: 'pointer',
          display: 'flex',
          height: 40,
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          width: 40,
        })}
        key={day}
        onClick={() => onDateClick(currentDay, focusedField)}
      >
        {day}
      </Box>
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
            <SvgIcon component={chevronLeft} viewBox="0 0 25 25" />
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
            <SvgIcon component={chevronRight} viewBox="0 0 25 25" />
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
