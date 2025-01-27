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
  const [focusedField, setFocusedField] = useState<'end' | 'start'>('start');

  const handleOpen = (
    event: React.MouseEvent<HTMLElement>,
    field: 'end' | 'start'
  ) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
    setFocusedField(field);

    // Validate dates when the popover is opened
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

  const handleStartDateChange = (date: DateTime | null) => {
    setStartDate(date);
    validateDates(date, endDate);
    if (date) {
      setCurrentMonth(date); // Update calendar to show the new start date
    }
  };

  const handleEndDateChange = (date: DateTime | null) => {
    setEndDate(date);
    validateDates(startDate, date);
  };

  const handlePresetSelect = (
    selectedStartDate: DateTime | null,
    selectedEndDate: DateTime | null
  ) => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setFocusedField('start');
    setCurrentMonth(selectedStartDate || DateTime.now());

    // Clear errors when preset is selected
    setStartDateError('');
    setEndDateError('');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <DateField
          errorText={startDateError}
          label="Start Date"
          onChange={handleStartDateChange}
          onClick={(e) => handleOpen(e, 'start')}
          placeholder="YYYY-MM-DD"
          value={startDate}
        />
        <DateField
          errorText={endDateError}
          label="End Date"
          onChange={handleEndDateChange}
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
            onDateClick={(date) => {
              if (focusedField === 'start') {
                handleStartDateChange(date);
                setFocusedField('end');
              } else {
                handleEndDateChange(date);
              }
            }}
            direction="left"
            endDate={endDate}
            focusedField={focusedField}
            month={currentMonth}
            setMonth={setCurrentMonth}
            startDate={startDate}
          />
          <Calendar
            onDateClick={(date) => {
              if (focusedField === 'start') {
                handleStartDateChange(date);
                setFocusedField('end');
              } else {
                handleEndDateChange(date);
              }
            }}
            direction="right"
            endDate={endDate}
            focusedField={focusedField}
            month={currentMonth.plus({ months: 1 })}
            setMonth={(date) => setCurrentMonth(date.minus({ months: 1 }))}
            startDate={startDate}
          />
        </Box>
      </Popover>
    </Box>
  );
};
