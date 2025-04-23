import { Popover, useTheme, useMediaQuery } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTime } from 'luxon';
import React, { useRef, useState } from 'react';

import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
import { Divider } from '../../Divider/Divider';
import { Stack } from '../../Stack/Stack';
import { Calendar } from '../Calendar/Calendar';
import { DateField } from '../DateField';
import { Presets } from './Presets';

import type { SxProps } from '@mui/material/styles';

export interface DateRangePickerProps {
  /** Properties for the end date field */
  endDateProps?: {
    /** Custom error message for invalid end date */
    errorMessage?: string;
    /** Label for the end date field */
    label?: string;
    /** placeholder for the end date field */
    placeholder?: string;
    /** Whether to show the timezone selector for the end date */
    showTimeZone?: boolean;
    /** Initial or controlled value for the end date-time */
    value?: DateTime | null;
  };

  /** Format for displaying the date-time */
  format?: 'MM/dd/yyyy' | 'dd-MM-yyyy' | 'yyyy-MM-dd';

  /** Callback when the date-time range changes,
   * this returns start date, end date in ISO formate,
   * preset value and timezone
   * */
  onApply?: (params: {
    endDate: null | string;
    selectedPreset: null | string;
    startDate: null | string;
    timeZone?: null | string;
  }) => void;

  /** Additional settings for the presets dropdown */
  presetsProps?: {
    /** Default value for the presets field */
    defaultValue?: string;
    /** If true, shows the date presets field instead of the date pickers */
    enablePresets?: boolean;
  };

  /** Properties for the start date field */
  startDateProps?: {
    /** Custom error message for invalid start date */
    errorMessage?: string;
    /** Label for the start date field */
    label?: string;
    /** placeholder for the start date field */
    placeholder?: string;
    /** Whether to show the timezone selector for the start date */
    showTimeZone?: boolean;
    /** Initial or controlled value for the start timezone */
    timeZoneValue?: null | string;
    /** Initial or controlled value for the start date-time */
    value?: DateTime | null;
  };

  /** Any additional styles to apply to the root element */
  sx?: SxProps;
}

export const DateRangePicker = ({
  endDateProps,
  format,
  onApply,
  presetsProps,
  startDateProps,
  sx,
}: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState<DateTime | null>(
    startDateProps?.value ?? null
  );
  const [selectedPreset, setSelectedPreset] = useState<null | string>(
    presetsProps?.defaultValue ?? null
  );
  const [endDate, setEndDate] = useState<DateTime | null>(
    endDateProps?.value ?? null
  );
  const [startDateError, setStartDateError] = useState(
    startDateProps?.errorMessage
  );
  const [endDateError, setEndDateError] = useState(endDateProps?.errorMessage);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const [focusedField, setFocusedField] = useState<'end' | 'start'>('start'); // Tracks focused input field

  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    onApply?.({
      endDate: endDate ? endDate.toISODate() : null,
      selectedPreset,
      startDate: startDate ? startDate.toISODate() : null,
    });
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
    <LocalizationProvider dateAdapter={AdapterLuxon}>
      <Box>
        <Stack direction="row" spacing={2} sx={sx}>
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
            format={format}
            inputRef={startDateInputRef}
            label={startDateProps?.label ?? 'Start Date'}
            onClick={() => handleOpen('start')}
            value={startDate}
          />
          <DateField
            onChange={(date) => {
              setEndDate(date);
            }}
            errorText={endDateError}
            format={format}
            inputRef={endDateInputRef}
            label={endDateProps?.label ?? 'End Date'}
            onClick={() => handleOpen('end')}
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
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          disableAutoFocus
          open={open}
          role="dialog"
          sx={{ boxShadow: 3, zIndex: 1300 }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <Box
            bgcolor="background.paper"
            boxShadow={4}
            display="flex"
            gap={2}
            paddingRight={2}
            sx={{ overflowX: isSmallScreen ? 'auto' : '' }}
          >
            {presetsProps?.enablePresets && (
              <Presets
                onPresetSelect={handlePresetSelect}
                selectedPreset={selectedPreset}
              />
            )}
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
    </LocalizationProvider>
  );
};
