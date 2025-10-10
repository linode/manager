import { styled } from '@mui/material/styles';
import { DateTime } from 'luxon';
import * as React from 'react';

import ChevronLeftIcon from '../../../assets/icons/chevron-left.svg';
import ChevronRightIcon from '../../../assets/icons/chevron-right.svg';
import { Box } from '../../Box/Box';
import { IconButton } from '../../IconButton';
import { Stack } from '../../Stack/Stack';
import { Typography } from '../../Typography/Typography';
import { DayBox, DayBoxInner } from './Calendar.styles';

import type { DateTime as DateTimeType } from 'luxon';

interface CalendarProps {
  direction: 'left' | 'right';
  endDate: DateTimeType | null;
  focusedField: 'end' | 'start';
  month: DateTimeType;
  onDateClick: (date: DateTimeType, field: 'end' | 'start') => void;
  setMonth: (date: DateTimeType) => void;
  startDate: DateTimeType | null;
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
  const today = DateTime.now();
  const isDateRange =
    startDate &&
    endDate &&
    startDate.isValid &&
    endDate.isValid &&
    !startDate.hasSame(endDate, 'day');
  // Calculate dynamic grid size based on actual content
  const days = [];

  // Fill leading empty slots before the first day of the month
  for (let i = 0; i < startDay; i++) {
    days.push(<Box key={`empty-${i}`} sx={{ height: 32, width: 32 }} />);
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
    const isStart =
      startDate && startDate.isValid && currentDay.hasSame(startDate, 'day');
    const isEnd =
      endDate && endDate.isValid && currentDay.hasSame(endDate, 'day');
    const isToday = currentDay.hasSame(today, 'day');

    // Determine visual boundaries for cross-month date ranges
    // This ensures rounded edges appear at the first/last visible dates in each month
    const prevDay = day > 1 ? month.set({ day: day - 1 }) : null;
    const nextDay = day < totalDaysInMonth ? month.set({ day: day + 1 }) : null;

    // Check if adjacent days in this month are also selected
    // This is used to determine visual boundaries for background connections
    const prevDaySelected =
      prevDay &&
      startDate &&
      endDate &&
      startDate.isValid &&
      endDate.isValid &&
      prevDay >= startDate &&
      prevDay <= endDate;

    // Check if the next day is selected in any way:
    // 1. Part of the same range (between start and end dates)
    // 2. The start date itself (for single date selections)
    // 3. The end date itself (for single date selections)
    // This ensures adjacent selected dates connect visually, even if they're separate selections
    const nextDaySelected =
      nextDay &&
      ((startDate &&
        endDate &&
        startDate.isValid &&
        endDate.isValid &&
        nextDay >= startDate &&
        nextDay <= endDate) ||
        (startDate && startDate.isValid && nextDay.hasSame(startDate, 'day')) ||
        (endDate && endDate.isValid && nextDay.hasSame(endDate, 'day')));

    // Check if this is the start/end of a week (Sunday/Saturday)
    const isWeekStart = currentDay.weekday === 7; // Sunday
    const isWeekEnd = currentDay.weekday === 6; // Saturday

    // Visual start: actual start OR first selected day in this month OR week start
    const isVisualStart =
      isStart ||
      (isSelected && !prevDaySelected) ||
      (isSelected && isWeekStart);
    // Visual end: actual end OR last selected day in this month OR week end
    const isVisualEnd =
      isEnd || (isSelected && !nextDaySelected) || (isSelected && isWeekEnd);

    days.push(
      <DayBox
        aria-selected={Boolean(isSelected || isStart || isEnd)}
        isEnd={isVisualEnd}
        isRange={isDateRange}
        isSelected={isSelected}
        isStart={isVisualStart}
        key={`${month.month} ${day}`}
        onClick={() => onDateClick(currentDay, focusedField)}
      >
        <DayBoxInner isEnd={isEnd} isStart={isStart} isToday={isToday}>
          {day}
        </DayBoxInner>
      </DayBox>,
    );
  }

  // Only add trailing empty slots to complete the last row (avoid entirely empty rows)
  const currentCells = days.length;
  const totalCellsNeeded = Math.ceil(currentCells / 7) * 7; // Round up to complete rows
  const remainingCells = totalCellsNeeded - currentCells;

  for (let i = 0; i < remainingCells; i++) {
    days.push(<Box key={`empty-after-${i}`} sx={{ height: 32, width: 32 }} />);
  }

  return (
    <Box paddingBottom={2}>
      {/* Header (Month & Year) */}
      <Stack
        alignItems="center"
        direction="row"
        display="flex"
        gap={(theme) => theme.spacingFunction(8)}
        paddingBottom={(theme) => theme.spacingFunction(8)}
        paddingLeft={(theme) => theme.spacingFunction(22)}
        paddingRight={(theme) => theme.spacingFunction(22)}
        sx={(theme) => ({
          borderBottom: `1px solid ${theme.tokens.component.Calendar.Border}`,
        })}
        textAlign={direction}
      >
        <NavigationSpacer>
          {direction === 'left' && (
            <IconButton
              disableRipple
              onClick={() => setMonth(month.minus({ months: 1 }))}
              size="medium"
              sx={(theme) => ({
                color: theme.tokens.component.Calendar.Icon,
              })}
            >
              <ChevronLeftIcon />
            </IconButton>
          )}
        </NavigationSpacer>
        {/* Display Month & Year */}

        <Typography
          sx={(theme) => ({
            flexGrow: 1,
            textAlign: 'center',
            font: theme.tokens.alias.Typography.Label.Bold.S,
          })}
        >
          {month.toFormat('MMMM yyyy')}
        </Typography>

        <NavigationSpacer>
          {direction === 'right' && (
            <IconButton
              disableRipple
              onClick={() => setMonth(month.plus({ months: 1 }))}
              size="medium"
              sx={(theme) => ({
                color: theme.tokens.component.Calendar.Icon,
              })}
            >
              <ChevronRightIcon />
            </IconButton>
          )}
        </NavigationSpacer>
      </Stack>

      {/* Calendar Grid */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(7, 32px)"
        paddingLeft={(theme) => theme.spacingFunction(12)}
        paddingRight={(theme) => theme.spacingFunction(12)}
        rowGap={(theme) => theme.spacingFunction(2)}
      >
        {/* Weekday Labels */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, index) => (
          <Typography
            align="center"
            key={`weekday-${index}`}
            sx={(theme) => ({
              color: theme.tokens.component.Calendar.Text.Default,
              font: theme.tokens.alias.Typography.Label.Bold.Xs,
              paddingTop: theme.spacingFunction(12),
              paddingBottom: theme.spacingFunction(12),
            })}
          >
            {d}
          </Typography>
        ))}
        {days}
      </Box>
    </Box>
  );
};

const NavigationSpacer = styled(Box, { label: 'NavigationSpacer' })(() => ({
  width: '36px', // Maintains consistent spacing when navigation buttons are hidden
}));
