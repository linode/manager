import { Popover } from '@mui/material';
import { DateTime } from 'luxon';
import React, { useRef, useState } from 'react';

import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
import { Divider } from '../../Divider/Divider';
import { Stack } from '../../Stack/Stack';
import { Calendar } from '../Calendar/Calendar';
import { DateTimeField } from '../DateTimeField';
import { Presets } from './Presets';

export const DateRangePicker = () => {
  const [startDate, setStartDate] = useState<DateTime | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<null | string>(null);
  const [endDate, setEndDate] = useState<DateTime | null>(null);
  const [startDateError, setStartDateError] = useState('');
  const [endDateError, setEndDateError] = useState('');
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const [focusedField, setFocusedField] = useState<'end' | 'start'>('start'); // Tracks focused input field

  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpen = (field: 'end' | 'start') => {
    setAnchorEl(
      startDateInputRef.current?.parentElement || startDateInputRef.current
    );
    setOpen(true);
    setFocusedField(field);
    validateDates(startDate, endDate);
  };

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
  };

  const handleApply = () => {
    handleClose();
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
    selectedEndDate: DateTime | null,
    selectedPresetLabel: null | string
  ) => {
    setStartDate(selectedStartDate);
    setEndDate(selectedEndDate);
    setSelectedPreset(selectedPresetLabel);
    setFocusedField('start'); // Reset focus to start after preset selection
    setCurrentMonth(selectedStartDate || DateTime.now());
    setStartDateError('');
    setEndDateError('');
  };

  return (
    <Box>
      <Stack direction="row" spacing={2}>
        <DateTimeField
          onChange={(date) => {
            debugger;
            setStartDate(date);

            // Clear end date **only** if the new start date is after the current end date
            if (endDate && date && date > endDate) {
              setEndDate(null);
            }
            setFocusedField('end'); // Automatically focus on end date
          }}
          errorText={startDateError}
          handleClose={handleClose}
          inputRef={startDateInputRef}
          label="Start Date"
          onClick={() => handleOpen('start')}
          // otherFieldRef={endDateInputRef}
          placeholder="MM-DD-YYYY"
          value={startDate}
        />
        <DateTimeField
          onChange={(date) => {
            setEndDate(date);
          }}
          errorText={endDateError}
          handleClose={handleClose}
          inputRef={endDateInputRef}
          label="End Date"
          onClick={() => handleOpen('end')}
          // otherFieldRef={startDateInputRef}
          placeholder="MM-DD-YYYY"
          value={endDate}
        />
      </Stack>
      <Popover
        onClose={(e: React.SyntheticEvent<HTMLElement>) => {
          const target = e.target as HTMLElement;

          // Check if click is inside the input field (anchorEl)
          const isClickInsideInput = anchorEl?.contains(target);

          // Check if click is inside the Popover itself
          const isClickInsidePopover = target.closest('.MuiPopover-paper');

          if (isClickInsideInput || isClickInsidePopover) {
            return; // Prevent closing if clicked inside input or popover
          }

          handleClose(); // Close popover only when clicking outside
        }}
        // onClose={() => undefined}
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        disableAutoFocus
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
          paddingRight={2}
        >
          <Presets
            onPresetSelect={handlePresetSelect}
            selectedPreset={selectedPreset}
          />
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
        <Divider spacingBottom={0} spacingTop={0} />
        <Box display="flex" gap={2} justifyContent="flex-end" padding={2}>
          <Button buttonType="outlined" onClick={handleClose}>
            Cancel
          </Button>
          <Button buttonType="primary" onClick={handleApply}>
            Apply
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};
