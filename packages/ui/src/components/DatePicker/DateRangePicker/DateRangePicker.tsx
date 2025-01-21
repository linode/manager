import { Popover } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { Box } from '../../Box/Box';
import { Stack } from '../../Stack/Stack';
import { TextField } from '../../TextField/TextField';
import { Calendar } from '../Calendar/Calendar';
import { Presets } from './Presets';

export const DateRangePicker = () => {
  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);
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
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handlePresetSelect = (
    selectedStartDate: DateTime | null,
    selectedEndDate: DateTime | null
  ) => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    if (selectedStartDate) {
      setCurrentMonth(selectedStartDate);
    }
  };

  const formatDate = (date: DateTime | null) =>
    date ? date.toFormat('yyyy-LL-dd') : '';

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Start Date"
          onClick={(e) => handleOpen(e, 'start')}
          placeholder="Select start date"
          value={formatDate(startDate)}
        />
        <TextField
          label="End Date"
          onClick={(e) => handleOpen(e, 'end')}
          placeholder="Select end date"
          value={formatDate(endDate)}
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
                setStartDate(date);
                setFocusedField('end');
              } else {
                setEndDate(date);
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
                setStartDate(date);
                setFocusedField('end');
              } else {
                setEndDate(date);
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
