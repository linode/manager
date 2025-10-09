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
import { PRESET_LABELS } from '../utils';

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

type TimeZoneStrategy = {
  keepEndTime: boolean;
  keepStartTime: boolean;
};

const strategies: Record<string, TimeZoneStrategy> = {
  'last month': { keepStartTime: true, keepEndTime: true },
  reset: { keepStartTime: true, keepEndTime: true },
  'this month': { keepStartTime: true, keepEndTime: false },
  default: { keepStartTime: false, keepEndTime: false },
};

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
    presetsProps?.defaultValue ?? PRESET_LABELS.RESET,
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

  // Persist previous state values
  const previousValues = useRef<{
    endDate: DateTime | null;
    selectedPreset: null | string;
    startDate: DateTime | null;
    timeZone: string;
  }>({
    endDate: endDateProps?.value ?? null,
    startDate: startDateProps?.value ?? null,
    selectedPreset: presetsProps?.defaultValue ?? null,
    timeZone: timeZoneProps?.defaultValue ?? 'UTC', // fallback to a string
  });

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
    // Revert values
    setStartDate(previousValues.current.startDate);
    setEndDate(previousValues.current.endDate);
    setTimeZone(previousValues.current.timeZone);
    setSelectedPreset(previousValues.current.selectedPreset);

    // Clear errors
    setStartDateError('');
    setEndDateError('');
    setOpen(false);
    setAnchorEl(null);
  };

  const handleApply = () => {
    if (startDateError || endDateError) {
      return;
    }

    onApply?.({
      endDate: endDate ? endDate.toISO() : null,
      selectedPreset,
      startDate: startDate ? startDate.toISO() : null,
      timeZone,
    });

    // Save current values
    previousValues.current = {
      startDate,
      endDate,
      timeZone,
      selectedPreset,
    };

    handleClose();
  };

  const getTimeZoneStrategy = (preset: null | string): TimeZoneStrategy => {
    return strategies[preset ?? 'default'] || strategies.default;
  };

  const handleTimeZoneChange = (newTimeZone: string) => {
    if (!newTimeZone) {
      return;
    }
    setTimeZone(newTimeZone);

    const { keepEndTime, keepStartTime } = getTimeZoneStrategy(selectedPreset);

    setStartDate((prev) =>
      prev ? prev.setZone(newTimeZone, { keepLocalTime: keepStartTime }) : null,
    );

    setEndDate((prev) =>
      prev ? prev.setZone(newTimeZone, { keepLocalTime: keepEndTime }) : null,
    );
  };

  const validateDates = (
    newStartDate: DateTime | null,
    newEndDate: DateTime | null,
  ) => {
    if (newStartDate && newEndDate && newStartDate > newEndDate) {
      setStartDateError(
        startDateProps?.errorMessage ??
          'Start date must be earlier than or equal to end date.',
      );
      setEndDateError(
        endDateProps?.errorMessage ??
          'End date must be later than or equal to start date.',
      );
    } else {
      setStartDateError('');
      setEndDateError('');
    }
  };

  const handleDateSelection = (date: DateTime) => {
    setSelectedPreset(PRESET_LABELS.RESET); // Reset preset selection on manual date selection

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
          slotProps={{
            paper: {
              sx: {
                overflow: 'inherit', // Allow timezone to overflow
              },
            },
          }}
          sx={(theme) => ({
            boxShadow: 3,
            zIndex: 1300,
            mt: startDateError || endDateError ? theme.spacingFunction(24) : 0,
          })}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        >
          <Box
            bgcolor={theme.tokens.component.Calendar.Background}
            boxShadow={4}
            display="flex"
            gap={2}
            paddingRight={2}
            sx={{ overflowX: isSmallScreen ? 'auto' : '' }}
          >
            {presetsProps?.enablePresets && (
              <Presets
                onPresetSelect={handlePresetSelect}
                presetLabels={PRESET_LABELS}
                selectedPreset={selectedPreset}
                timeZone={timeZone}
              />
            )}
            <Box>
              <Box display="flex" sx={{ padding: theme.spacingFunction(8) }}>
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
                gap={() => theme.spacingFunction(8)}
                justifyContent="space-between"
                paddingBottom={2}
              >
                <TimePicker
                  key={`start-time-picker-${timeZone}`}
                  label="Start Time"
                  onChange={(newTime: DateTime | null) => {
                    if (newTime) {
                      setStartDate((prev) => {
                        const updatedValue =
                          prev?.set({
                            hour: newTime.hour,
                            minute: newTime.minute,
                          }) ?? newTime;
                        validateDates(updatedValue, endDate);
                        return updatedValue;
                      });
                    }
                  }}
                  sx={{
                    flex: 1,
                    // Allows timezone selector to expand as needed
                    '& .MuiPickersInputBase-sectionsContainer': {
                      width: 'inherit',
                    },
                  }}
                  value={startDate}
                />
                <TimePicker
                  key={`end-time-picker}-${timeZone}`}
                  label="End Time"
                  onChange={(newTime: DateTime | null) => {
                    if (newTime) {
                      setEndDate((prev) => {
                        const updatedValue =
                          prev?.set({
                            hour: newTime.hour,
                            minute: newTime.minute,
                          }) ?? newTime;
                        validateDates(startDate, updatedValue);
                        return updatedValue;
                      });
                    }
                  }}
                  sx={{
                    flex: 1,
                    // Allows timezone selector to expand as needed
                    '& .MuiPickersInputBase-sectionsContainer': {
                      width: 'inherit',
                    },
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
          <Box
            bgcolor={theme.tokens.component.Calendar.Background}
            display="flex"
            gap={2}
            justifyContent="flex-end"
            padding={2}
          >
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

// Expose the constant via a static property on the component
DateTimeRangePicker.PRESET_LABELS = PRESET_LABELS;
