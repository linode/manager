import { Popover } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { Box } from '../../Box/Box';
import { Stack } from '../../Stack/Stack';
import { Calendar } from '../Calendar/Calendar';
import { DateField } from '../DateField';
import { Presets } from './Presets';

export const DateRangePicker = () => {
  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const [focusedField, setFocusedField] = useState<'end' | 'start'>('start'); // Tracks focused input field

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>,
    field: 'end' | 'start'
  ) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
    setFocusedField(field);
    validateDates(startDate, endDate);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const validateDates = (
    newStartDate: DateTime | null,
    newEndDate: DateTime | null
  ) => {
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      setStartDateError(
        'Start date must be earlier than or equal to end date.'
      );
      setEndDateError('End date must be later than or equal to start date.');
    } else {
      setStartDateError('');
      setEndDateError('');
    }
  };

  const handleDateSelection = (date: DateTime) => {
    if (focusedField === 'start') {
      setStartDate(date);

      // Clear end date **only** if the new start date is after the current end date
      if (endDate && date > endDate) {
        setEndDate(null);
      }

      setFocusedField('end'); // Automatically focus on the end date
    } else {
      if (startDate && date < startDate) {
        // If the selected end date is earlier than the start date, update the start date
        setStartDate(date);
        setEndDate(null); // Clear the end date
        setFocusedField('end'); // Refocus on the end date
      } else {
        setEndDate(date);
        setFocusedField('start'); // Loop back to start date
      }
    }
    validateDates(startDate, endDate);
  };

  const handlePresetSelect = (
    selectedStartDate: DateTime | null,
    selectedEndDate: DateTime | null
  ) => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setFocusedField('start'); // Reset focus to start after preset selection
    setCurrentMonth(selectedStartDate || DateTime.now());
    setStartDateError('');
    setEndDateError('');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <DateField
          onChange={(date) => {
            setStartDate(date);

            // Clear end date **only** if the new start date is after the current end date
            if (endDate && date && date > endDate) {
              setEndDate(null);
            }
            setFocusedField('end'); // Automatically focus on end date
          }}
          errorText={startDateError}
          label="Start Date"
          onClick={(e) => handleOpen(e, 'start')}
          placeholder="YYYY-MM-DD"
          value={startDate}
        />
        <DateField
          onChange={(date) => {
            setEndDate(date);
          }}
          errorText={endDateError}
          label="End Date"
          onClick={(e) => handleOpen(e, 'end')}
          placeholder="YYYY-MM-DD"
          value={endDate}
        />
      </Stack>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={handleClose}
        open={open}
        sx={{ boxShadow: 3, zIndex: 1300 }}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <Box
          bgcolor="background.paper"
          borderRadius={2}
          boxShadow={4}
          display="flex"
          gap={2}
          p={2}
        >
          <Presets onPresetSelect={handlePresetSelect} />
          <Calendar
            direction="left"
            endDate={endDate}
            focusedField={focusedField}
            month={currentMonth}
            onDateClick={handleDateSelection}
            setMonth={setCurrentMonth}
            startDate={startDate}
          />
          <Calendar
            direction="right"
            endDate={endDate}
            focusedField={focusedField}
            month={currentMonth.plus({ months: 1 })}
            onDateClick={handleDateSelection}
            setMonth={(date) => setCurrentMonth(date.minus({ months: 1 }))}
            startDate={startDate}
          />
        </Box>
      </Popover>
    </Box>
  );
};
