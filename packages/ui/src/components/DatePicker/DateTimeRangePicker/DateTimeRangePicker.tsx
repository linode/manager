import { Popover, useMediaQuery, useTheme } from '@mui/material';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTime } from 'luxon';
import React, { useRef, useState } from 'react';

import { Box } from '../../Box/Box';
import { Button } from '../../Button/Button';
import { Divider } from '../../Divider/Divider';
import { Stack } from '../../Stack/Stack';
import { Calendar } from '../Calendar/Calendar';
import { Presets } from '../DateRangePicker/Presets';
import { DateTimeField } from '../DateTimeField';
import { TimePicker } from '../TimePicker';
import { TimeZoneSelect } from '../TimeZoneSelect';

import type { SxProps } from '@mui/material/styles';
export interface DateTimeRangePickerProps {
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
  format?:
    | 'dd-MM-yyyy HH:mm'
    | 'dd-MM-yyyy hh:mm a'
    | 'MM/dd/yyyy HH:mm'
    | 'MM/dd/yyyy hh:mm a'
    | 'yyyy-MM-dd HH:mm'
    | 'yyyy-MM-dd hh:mm a';

  /** Callback when the date-time range changes,
   * this returns start date, end date in ISO formate,
   * preset value and timezone
   * */
  onApply?: (params: {
    endDate: null | string;
    selectedPreset: null | string;
    startDate: null | string;
    timeZone: null | string;
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

  /** Properties for the time zone selector */
  timeZoneProps?: {
    /** Default value to be selected */
    defaultValue?: string;
    /** If true, disables the timezone selector */
    disabled?: boolean;
  };
}

export const DateTimeRangePicker = ({
  endDateProps,
  format,
  onApply,
  presetsProps,
  startDateProps,
  timeZoneProps,
  sx,
}: DateTimeRangePickerProps) => {
  const [startDate, setStartDate] = useState<DateTime | null>(
    startDateProps?.value ?? null,
  );
  const [selectedPreset, setSelectedPreset] = useState<null | string>(
    presetsProps?.defaultValue ?? 'reset',
  );
  const [endDate, setEndDate] = useState<DateTime | null>(
    endDateProps?.value ?? null,
  );
  const [startDateError, setStartDateError] = useState(
    startDateProps?.errorMessage,
  );
  const [endDateError, setEndDateError] = useState(endDateProps?.errorMessage);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [currentMonth, setCurrentMonth] = useState(DateTime.now());
  const [focusedField, setFocusedField] = useState<'end' | 'start'>('start'); // Tracks focused input field
  const [timeZone, setTimeZone] = useState<string>(
    timeZoneProps?.defaultValue ?? 'UTC',
  ); // Default timezone

  const startDateInputRef = useRef<HTMLInputElement | null>(null);
  const endDateInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const handleOpen = (field: 'end' | 'start') => {
    setAnchorEl(
      startDateInputRef.current?.parentElement || startDateInputRef.current,
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
      endDate: endDate ? endDate.toISO() : null,
      selectedPreset,
      startDate: startDate ? startDate.toISO() : null,
      timeZone,
    });
    handleClose();
  };

  const handleTimeZoneChange = (newTimeZone: string) => {
    if (!newTimeZone) {
      return;
    }
    setTimeZone(newTimeZone);

    // keep date time same irrespective of timezone change
    if (selectedPreset === 'last month' || selectedPreset === 'reset') {
      setStartDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: true }) : null,
      );
      setEndDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: true }) : null,
      );
      // change only end date based on the timezone
    } else if (selectedPreset === 'this month') {
      setStartDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: true }) : null,
      );
      setEndDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: false }) : null,
      );
      // change both the values based on the timezone
    } else {
      setStartDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: false }) : null,
      );
      setEndDate((prev) =>
        prev ? prev.setZone(newTimeZone, { keepLocalTime: false }) : null,
      );
    }
  };

  const validateDates = (
    newStartDate: DateTime | null,
    newEndDate: DateTime | null,
  ) => {
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      setStartDateError(
        'Start date must be earlier than or equal to end date.',
      );
      setEndDateError('End date must be later than or equal to start date.');
    } else {
      setStartDateError('');
      setEndDateError('');
    }
  };

  const handleDateSelection = (date: DateTime) => {
    setSelectedPreset('reset'); // Reset preset selection on manual date selection

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
    selectedPresetLabel: null | string,
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
          <DateTimeField
            errorText={startDateError}
            format={format}
            inputRef={startDateInputRef}
            label={startDateProps?.label ?? 'Start Date'}
            onChange={(date) => {
              setStartDate(date);

              // Clear end date **only** if the new start date is after the current end date
              if (endDate && date && date > endDate) {
                setEndDate(null);
              }
              setFocusedField('end'); // Automatically focus on end date
            }}
            onClick={() => handleOpen('start')}
            value={startDate}
          />
          <DateTimeField
            errorText={endDateError}
            format={format}
            inputRef={endDateInputRef}
            label={endDateProps?.label ?? 'End Date'}
            onChange={(date) => {
              setEndDate(date);
            }}
            onClick={() => handleOpen('end')}
            value={endDate}
          />
        </Stack>
        <Popover
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          disableAutoFocus
          onClose={handleClose}
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
                timeZone={timeZone}
              />
            )}
            <Box>
              <Box display="flex" gap={2}>
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
                  setMonth={(date) =>
                    setCurrentMonth(date.minus({ months: 1 }))
                  }
                  startDate={startDate}
                />
              </Box>
              <Box
                display="flex"
                gap={2}
                justifyContent="space-between"
                paddingBottom={2}
              >
                <TimePicker
                  label="Start Time"
                  onChange={(newTime) => {
                    if (newTime) {
                      setStartDate(
                        (prev) =>
                          prev?.set({
                            hour: newTime.hour,
                            minute: newTime.minute,
                          }) ?? newTime,
                      );
                    }
                  }}
                  value={startDate}
                />
                <TimePicker
                  label="End Time"
                  onChange={(newTime) => {
                    if (newTime) {
                      setEndDate(
                        (prev) =>
                          prev?.set({
                            hour: newTime.hour,
                            minute: newTime.minute,
                          }) ?? newTime,
                      );
                    }
                  }}
                  value={endDate}
                />
                <TimeZoneSelect
                  disabled={timeZoneProps?.disabled}
                  noMarginTop
                  onChange={handleTimeZoneChange}
                  value={timeZone}
                />
              </Box>
            </Box>
          </Box>
          <Divider spacingBottom={0} spacingTop={0} />
          <Box display="flex" gap={2} justifyContent="flex-end" padding={2}>
            <Button buttonType="outlined" data-qa-buttons onClick={handleClose}>
              Cancel
            </Button>
            <Button
              buttonType="primary"
              data-qa-buttons="apply"
              onClick={handleApply}
            >
              Apply
            </Button>
          </Box>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};
