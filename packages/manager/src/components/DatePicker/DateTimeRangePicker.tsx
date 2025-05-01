import { Autocomplete, Box, StyledActionButton } from '@linode/ui';
import { useTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { DateTime } from 'luxon';
import React, { useState } from 'react';

import { DateTimePicker } from './DateTimePicker';

import type { SxProps, Theme } from '@mui/material/styles';

export interface DateTimeRangePickerProps {
  /** If true, disable the timezone drop down */
  disabledTimeZone?: boolean;

  /** If true, shows the date presets field instead of the date pickers */
  enablePresets?: boolean;

  /** Properties for the end date field */
  endDateProps?: {
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
  format?: string;

  /** Callback when the date-time range changes,
   * this returns start date, end date in ISO formate,
   * preset value and timezone
   * */
  onChange?: (params: {
    end: null | string;
    preset?: string;
    start: null | string;
    timeZone?: null | string;
  }) => void;

  /** Additional settings for the presets dropdown */
  presetsProps?: {
    /** Default value for the presets field */
    defaultValue?: string;
    /** Label for the presets field */
    label?: string;
    /** placeholder for the presets field */
    placeholder?: string;
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
  sx?: SxProps<Theme>;
}

type DatePresetType =
  | '1hour'
  | '7days'
  | '12hours'
  | '24hours'
  | '30days'
  | '30minutes'
  | 'custom_range'
  | 'last_month'
  | 'this_month';

const presetsOptions: { label: string; value: DatePresetType }[] = [
  { label: 'Last 30 Minutes', value: '30minutes' },
  { label: 'Last 1 Hour', value: '1hour' },
  { label: 'Last 12 Hours', value: '12hours' },
  { label: 'Last 24 Hours', value: '24hours' },
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Last Month', value: 'last_month' },
  { label: 'Custom', value: 'custom_range' },
];

export const DateTimeRangePicker = (props: DateTimeRangePickerProps) => {
  const {
    disabledTimeZone = false,

    enablePresets = false,

    endDateProps: {
      label: endLabel = 'End Date and Time',
      placeholder: endDatePlaceholder,
      showTimeZone: showEndTimeZone = false,
      value: endDateTimeValue = null,
    } = {},
    format = 'yyyy-MM-dd HH:mm',
    onChange,
    presetsProps: {
      defaultValue: presetsDefaultValue = presetsOptions[0].value,
      label: presetsLabel = 'Time Range',
      placeholder: presetsPlaceholder = 'Select a preset',
    } = {},
    startDateProps: {
      errorMessage:
        startDateErrorMessage = 'Start date/time cannot be after the end date/time.',
      label: startLabel = 'Start Date and Time',
      placeholder: startDatePlaceholder,
      showTimeZone: showStartTimeZone = false,
      timeZoneValue: startTimeZoneValue = null,
      value: startDateTimeValue = null,
    } = {},
    sx,
  } = props;
  const [startDateTime, setStartDateTime] = useState<DateTime | null>(
    startDateTimeValue ??
      DateTime.now().set({ second: 0 }).minus({ minutes: 30 })
  );
  const [endDateTime, setEndDateTime] = useState<DateTime | null>(
    endDateTimeValue ?? DateTime.now().set({ second: 0 })
  );
  const [presetValue, setPresetValue] = useState<
    | undefined
    | {
        label: string;
        value: string;
      }
  >(
    presetsOptions.find((option) => option.value === presetsDefaultValue) ??
      presetsOptions[0]
  );
  const [startTimeZone, setStartTimeZone] = useState<null | string>(
    startTimeZoneValue
  );
  const [startDateError, setStartDateError] = useState<null | string>(null);
  const [showPresets, setShowPresets] = useState(
    presetsDefaultValue
      ? presetsDefaultValue !== 'custom_range' && enablePresets
      : enablePresets
  );
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

  const validateDates = (
    start: DateTime | null,
    end: DateTime | null,
    source: 'end' | 'start'
  ) => {
    if (start && end && source === 'start' && start > end) {
      setStartDateError(startDateErrorMessage);
      return;
    }
    // Reset validation errors
    setStartDateError(null);
  };

  const handlePresetSelection = (value: DatePresetType) => {
    const now = DateTime.now().set({ second: 0 });
    let newStartDateTime: DateTime | null = null;
    let newEndDateTime: DateTime | null = now;

    switch (value) {
      case '1hour':
        newStartDateTime = now.minus({ hours: 1 });
        break;
      case '7days':
        newStartDateTime = now.minus({ days: 7 });
        break;
      case '12hours':
        newStartDateTime = now.minus({ hours: 12 });
        break;
      case '24hours':
        newStartDateTime = now.minus({ hours: 24 });
        break;
      case '30days':
        newStartDateTime = now.minus({ days: 30 });
        break;
      case '30minutes':
        newStartDateTime = now.minus({ minutes: 30 });
        break;
      case 'custom_range':
        newStartDateTime = startDateTime;
        newEndDateTime = endDateTime;
        break;
      case 'last_month':
        const lastMonth = DateTime.now().minus({ months: 1 });
        newStartDateTime = lastMonth.startOf('month');
        newEndDateTime = lastMonth.endOf('month');
        break;

      case 'this_month':
        newEndDateTime = DateTime.now();
        newStartDateTime = newEndDateTime.startOf('month');
        break;
      default:
        return;
    }

    setStartDateTime(newStartDateTime);
    setEndDateTime(newEndDateTime?.set({ second: 0 }) ?? null);
    setPresetValue(
      presetsOptions.find((option) => option.value === value) ??
        presetsOptions[0]
    );

    if (onChange) {
      onChange({
        end: newEndDateTime?.toISO() ?? null,
        preset: value,
        start: newStartDateTime?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }

    setShowPresets(value !== 'custom_range');
  };

  const handleStartDateTimeChange = (newStart: DateTime | null) => {
    setStartDateTime(newStart);
    validateDates(newStart, endDateTime, 'start');

    if (onChange) {
      onChange({
        end: endDateTime?.toISO() ?? null,
        preset: 'custom_range',
        start: newStart?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }
  };

  const handleEndDateTimeChange = (newEnd: DateTime | null) => {
    setEndDateTime(newEnd);
    validateDates(startDateTime, newEnd, 'end');

    if (onChange) {
      onChange({
        end: newEnd?.toISO() ?? null,
        preset: 'custom_range',
        start: startDateTime?.toISO() ?? null,
        timeZone: startTimeZone,
      });
    }
  };
  return (
    <Box display="flex" flexDirection="column" gap={2} sx={sx}>
      {showPresets ? (
        <Autocomplete
          data-qa-preset="preset-select"
          data-testid="preset-select"
          disableClearable
          fullWidth
          label={presetsLabel}
          noMarginTop
          onChange={(_, selection) => {
            if (selection) {
              handlePresetSelection(selection.value as DatePresetType);
            }
          }}
          options={presetsOptions}
          placeholder={presetsPlaceholder}
          value={presetValue}
        />
      ) : (
        <Box
          display="flex"
          flexDirection={isSmallScreen ? 'column' : 'row'}
          gap={2}
        >
          <DateTimePicker
            disabledTimeZone={disabledTimeZone}
            errorText={startDateError ?? undefined}
            format={format}
            label={startLabel}
            onChange={handleStartDateTimeChange}
            placeholder={startDatePlaceholder}
            showTimeZone={showStartTimeZone}
            timeSelectProps={{ label: 'Start Time' }}
            timeZoneSelectProps={{
              label: 'Start TimeZone',
              onChange: (value) => setStartTimeZone(value),
              value: startTimeZone,
            }}
            value={startDateTime}
          />
          <DateTimePicker
            disabledTimeZone={disabledTimeZone}
            format={format}
            label={endLabel}
            minDate={startDateTime || undefined}
            onChange={handleEndDateTimeChange}
            placeholder={endDatePlaceholder}
            showTimeZone={showEndTimeZone}
            timeSelectProps={{ label: 'End Time' }}
            timeZoneSelectProps={{
              value: startTimeZone,
            }}
            value={endDateTime}
          />
          <Box alignContent={startDateError ? 'center' : 'flex-end'}>
            <StyledActionButton
              data-qa-buttons="true"
              onClick={() => {
                setShowPresets(true);
                setPresetValue(undefined);
                setStartDateError(null);
              }}
              variant="text"
            >
              Presets
            </StyledActionButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};
