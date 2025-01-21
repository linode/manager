import { MenuItem, Select } from '@mui/material';
import * as React from 'react';

import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
import { Stack } from '../../Stack/Stack';
import { Typography } from '../../Typography/Typography';

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

  const years = Array.from({ length: 81 }, (_, i) => 1960 + i);
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
        sx={{
          '&:hover': { bgcolor: 'primary.200', color: 'text.primary' },
          alignItems: 'center',
          bgcolor: isStartOrEnd
            ? 'primary.main'
            : isSelected
            ? 'primary.light'
            : 'transparent',
          borderRadius: '50%',
          color: isStartOrEnd || isSelected ? 'white' : 'text.primary',
          cursor: 'pointer',
          display: 'flex',
          height: 40,
          justifyContent: 'center',
          transition: 'background-color 0.2s ease',
          width: 40,
        }}
        key={day}
        onClick={() => onDateClick(currentDay, focusedField)}
      >
        {day}
      </Box>
    );
  }

  return (
    <Box>
      <Stack
        alignItems="center"
        direction="row"
        justifyContent="center"
        marginBottom={3}
        spacing={1}
      >
        {direction === 'left' && (
          <Button onClick={() => setMonth(month.minus({ months: 1 }))}>
            &larr; {/* Left arrow HTML entity */}
          </Button>
        )}
        <Select
          onChange={(e) =>
            setMonth(month.set({ month: Number(e.target.value) }))
          }
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          size="small"
          value={month.month}
        >
          {months.map((monthName, index) => (
            <MenuItem key={monthName} value={index + 1}>
              {monthName}
            </MenuItem>
          ))}
        </Select>
        <Select
          onChange={(e) =>
            setMonth(month.set({ year: Number(e.target.value) }))
          }
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          size="small"
          value={month.year}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
        {direction === 'right' && (
          <Button onClick={() => setMonth(month.plus({ months: 1 }))}>
            &rarr; {/* Right arrow HTML entity */}
          </Button>
        )}
      </Stack>
      <Box display="grid" gap={1} gridTemplateColumns="repeat(7, 40px)">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, index) => (
          <Typography align="center" key={`weekday-${index}`}>
            {d}
          </Typography>
        ))}
        {days}
      </Box>
    </Box>
  );
};
